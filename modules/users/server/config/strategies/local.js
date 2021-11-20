'use strict';

/**
 * Module dependencies
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('mongoose').model('User');

module.exports = function () {
  // Use local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      function (email, password, done) {
        User.findOne({
          email: email.toLowerCase()
        })
          .populate('group', 'option')
          .exec(function (err, user) {
            if (err) {
              return done(err);
            }
            if (!user || !user.authenticate(password)) {
              return done(null, false, {
                message: 'GLOBAL.SIGNIN_ERROR',
                date: new Date().toLocaleTimeString()
              });
            }

            return done(null, user);
          });
      }
    )
  );
};
