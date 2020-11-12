const User = require('../models/user'); // So we have access to the schema
const Blog = require('../models/blog'); // So we have access to the schema
const shortId = require('shortid'); // Used to create usernames
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt'); // To check if token has expired and if it is valid.
const { errorHandler } = require('../helpers/dbErrorHandler');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');

// SendGrid.
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Google login
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
  const idToken = req.body.tokenId;

  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      console.log(response);

      const { email_verified, name, email, jti } = response.payload;

      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          // if user exists.|create token|place in cookie|send cookie, user and token back to client.
          if (user) {
            console.log(user);
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: '1d',
            });
            res.cookie('token', token, { expiresIn: '1d' });
            const { _id, email, name, role, username } = user;
            return res.json({ token, user: { _id, email, name, role, username } });
          } else {
            // if user does not exist. create user|save user|send cookie, token and user to client
            let username = shortId.generate();
            let profile = `${process.env.CLIENT_URL}/profile/${username}`;
            let password = jti;
            // for further security, let password = jti + process.env.JWT_SECRET

            user = new User({ name, email, profile, username, password });

            user.save((err, data) => {
              if (err) {
                return res.status(400).json({ error: errorHandler(err) });
              }
              const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, {
                expiresIn: '1d',
              });
              res.cookie('token', token, { expiresIn: '1d' });
              const { _id, email, name, role, username } = data;
              return res.json({ token, user: { _id, email, name, role, username } });
            });
          }
        });
      } else {
        return res.status(400).json({ error: 'Google login failed, try again.' });
      }
    });
};

// Pre signup

exports.preSignup = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (user) {
      return res.status(400).json({
        error: 'Email is taken',
      });
    }
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: '10m',
      }
    );
    console.log(email);
    const emailData = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: `Account activation link`,
      html: `
      <p>Please use the following link to activate your account</p>
      <p>${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
      <hr />
      <p>This email may contain sensitive information</p>
      <p>https://seoblog.com</p>
      `,
    };

    sgMail.send(emailData).then((sent) => {
      return res.json({
        message: `Email has been sent to ${email}. Follow the instructions to activate your account`,
      });
    });
  });
};

exports.signup = (req, res) => {
  const token = req.body.token;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Expired link. Signup again' });
      }

      const { name, email, password } = jwt.decode(token);

      let username = shortId.generate();
      let profile = `${process.env.CLIENT_URL}/profile/${username}`;

      const user = new User({ name, email, password, profile, username });
      user.save((err, user) => {
        if (err) {
          return res.status(401).json({ error: errorHandler(err) });
        }
        return res.json({
          message: 'Signup successful! Please signin',
        });
      });
    });
  } else {
    return res.json({
      message: 'Something went wrong. Try again',
    });
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  // 1. check if user exist
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exist, please signup',
      });
    }

    // 2. authenticate (matching the req password with the database password)
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: 'Email and password do not match',
      });
    }
    // 3. generate a token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.cookie('token', token, { expiresIn: '1d' });
    const { _id, username, name, email, role } = user;
    return res.json({
      token,
      user: { _id, username, name, email, role },
      message: 'Signin successful!',
    });
  });

  // generate a token and send to client
};

// SIGN OUT
// here we delete the cookie on the server side
exports.signout = (req, res) => {
  res.clearCookie('token');
  res.json({
    message: 'Signout success',
  });
};

// PROTECT ROUTES
// To protect routes we will use this requireSignin
// we will compare the incoming tokens secret with
// the one that is in the env file, it will also check expiry
// if it returns true the user will have access to the route.
// it also puts the user on the request object under req.auth
exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'], // added later
  userProperty: 'auth',
});
//////////////////////// Require AuthMiddleware
// User AuthMiddleware
// this middleware finds the user profile data and adds
// it to the reqest body
exports.authMiddleware = (req, res, next) => {
  //console.log(req);
  // 1. get user ID
  const authUserId = req.auth._id;
  console.log(authUserId);
  // 2. Find the user in the database in user model
  User.findById(authUserId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'User not found' });
    }
    req.profile = user;
    next();
  });
};

exports.canUpdateDeleteBlog = (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  Blog.findOne({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
    if (!authorizedUser) {
      return res.status(400).json({
        error: 'You are not authorized',
      });
    }
    next();
  });
};

// AdminMiddleware

exports.adminMiddleware = (req, res, next) => {
  // 1. get user ID
  const adminUserId = req.auth._id;
  // 2. Find the user in the database in user model
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.role !== 1) {
      return res.status(400).json({ error: 'Admin resource. Access denied' });
    }

    req.profile = user;
    next();
  });
};

//////////////////////// Passwords ///////////////////////

exports.forgotPassword = (req, res) => {
  // 1. get users email that is making the request.
  const { email } = req.body;
  // 2. verify if that user email exists.
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        error: 'User with that email does not exist',
      });
    }
    // 3. Generate the reset password token.
    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: '10m',
    });
    // 4. Send email to user

    const emailData = {
      to: email,
      from: process.env.EMAIL_TO,
      subject: `Password rest link`,
      html: `
      <p>Please use the following link to reset your password</p>
      <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
      <hr />
      <p>This email may contain sensitive information</p>
      <p>https://seoblog.com</p>
      `,
    };
    // 5. populate the database with the passowordReset
    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.json({ error: errorHandler(err) });
      } else {
        sgMail.send(emailData).then((sent) => {
          return res.json({
            message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10 minutes`,
          });
        });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  console.log('reset-password endpoint');
  // 1. get the restPasswordLink and newPassword from incomming request
  const { resetPasswordLink, newPassword } = req.body;
  // 2. Verify that the token has not expired.
  if (resetPasswordLink) {
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Expired link. Try again' });
      }
      // 3. If token valid find the user based on that temporary token.
      User.findOne({ resetPasswordLink }, (err, user) => {
        if (err || !user) {
          return res.status(401).json({ error: 'Something went wrong' });
        }
        // 4. If user is found we need to update the password.
        const updatedFields = {
          password: newPassword,
          resetPasswordLink: '',
        };

        // 5. update the fields that have changed.
        user = _.extend(user, updatedFields);
        // 6. save the newly updated user in the database.
        // if successful send a response
        user.save((err, result) => {
          if (err) {
            return res.status(400).json({ error: errorHandler(err) });
          }
          res.json({
            message: `Great! Now you can login with your new password`,
          });
        });
      });
    });
  }
};
////////////////////////////////////////////////////////////////

// exports.signup = (req, res) => {
//   // 1.
//   // Check if user already exists, then execute a function
//   // so if the result of user.findOne is successful we say email taken.
//   User.findOne({ email: req.body.email }).exec((err, user) => {
//     if (user) {
//       return res.status(400).json({
//         error: 'Email is taken',
//       });
//     }
//     // 2.
//     // the above step passes we now create a new user
//     // we take the name, email and password from the request
//     // and additionally we need to generate the username and profile

//     const { name, email, password } = req.body;
//     let username = shortId.generate();
//     let profile = `${process.env.CLIENT_URL}/profile/${username}`;

//     let newUser = new User({ name, email, password, profile, username });
//     // 3.
//     // Save that user to the database
//     newUser.save((err, success) => {
//       if (err) {
//         return res.status(400).json({
//           error: err,
//         });
//       }
//       // res.json({
//       //   user: success,
//       // });
//       res.json({
//         message: 'Signup successful! Please signin',
//       });
//     });
//   });
// };
