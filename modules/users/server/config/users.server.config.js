'use strict';

/**
 * Module dependencies
 */
var passport = require('passport');
var User = require('mongoose').model('User');
var path = require('path');
var config = require(path.resolve('./config/config'));

/**
 * Module init function
 */
module.exports = function (app) {
  // Serialize sessions
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // Deserialize sessions
  passport.deserializeUser(function (id, done) {
    User.findOne({ _id: id }, '-salt -password')
      .populate('group', 'option')
      .exec(function (err, user) {
        done(err, user);
      });
  });

  // Initialize strategies
  config.utils
    .getGlobbedPaths(path.join(__dirname, './strategies/**/*.js'))
    .forEach(function (strategy) {
      require(path.resolve(strategy))(config);
    });

  // Add passport's middleware
  app.use(passport.initialize());
  app.use(passport.session());
};
