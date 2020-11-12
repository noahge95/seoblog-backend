// This file is our entry point for our api server

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// bringing in routes
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
const formRoutes = require('./routes/form');

// app
// here we invoke express so its available on the app variable.
const app = express();

// db connection

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    dbName: process.env.DATABASE_NAME,
  })
  .then(() => console.log('DB connection sucessful!'));

// Middlewares
// we first use morgan in dev mode to see our endpoints when they
// get triggerd by the client
app.use(morgan('dev'));

// Here we make sure the json requests are made into objects
app.use(bodyParser.json({ limit: '50mb' }));

// Here we take the cookie from the http request header and make the req.cookies
app.use(cookieParser());

// cors
// We use cors to allow access to the api from a differnt port
// In development we will be running our backend api on port 8000
// Which is a different origin form the client which is port 3000
// When our NODE_ENV is development we want cors so we can access the backend from client port 3000.

// cors does not affect postman but only for browser to browser communication.
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

// Routes middleware
// since this is our api we prefix with /api
app.use('/api', blogRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use('/api', formRoutes);

// Port
// the api will run on this port
// if the port does not exist so not in the current process we will
// default to 8000
const port = process.env.PORT || 8000;

// Here we make express listen out for incoming connections
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
