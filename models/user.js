const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      max: 32,
      unique: true,
      index: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    profile: {
      type: String,
      required: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String,
    about: {
      type: String,
    },
    role: {
      type: Number,
      default: 0,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    resetPasswordLink: {
      data: String,
      default: '',
    },
  },
  { timestamps: true }
);

/////////////// PASSWORD HASH AND VIRTUAL SAVE.
// Here we ensure that we hash our password so converting
// the given key e.g the password and creating a new value.

// We do not want to persist the password in the database
// So we take the password from the client req
// We then hash the password and save as hashed_password

userSchema
  .virtual('password')
  .set(function (password) {
    // create a temp variable called _password
    this._password = password;

    // generate salt
    this.salt = this.makeSalt();

    // encrypt the password
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    // we return the _password as the virtual password property.
    return this._password;
  });

// METHODS
// This schema method is available to be used
userSchema.methods = {
  //

  // Authenticate a user if the password (plain text) entered
  // by the user matches the hash of the password
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  // Encrypt Password
  encryptPassword: function (password) {
    if (!password) {
      return '';
    }
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },

  // we add the salt to the password then encrypt
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  },
  //
};

module.exports = mongoose.model('User', userSchema);
