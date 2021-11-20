'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Lang = mongoose.model('Lang');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var lang;

/**
 * Lang routes tests
 */
describe('Lang Admin CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(mongoose.connection.db);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      usernameOrEmail: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      roles: ['user', 'admin'],
      username: credentials.usernameOrEmail,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new lang
    user
      .save()
      .then(function () {
        lang = {
          title: 'Lang Title',
          content: 'Lang Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an lang if logged in', function (done) {
    agent
      .post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new lang
        agent
          .post('/api/langs')
          .send(lang)
          .expect(200)
          .end(function (langSaveErr, langSaveRes) {
            // Handle lang save error
            if (langSaveErr) {
              return done(langSaveErr);
            }

            // Get a list of langs
            agent.get('/api/langs').end(function (langsGetErr, langsGetRes) {
              // Handle lang save error
              if (langsGetErr) {
                return done(langsGetErr);
              }

              // Get langs list
              var langs = langsGetRes.body;

              // Set assertions
              langs[0].user._id.should.equal(userId);
              langs[0].title.should.match('Lang Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an lang if signed in', function (done) {
    agent
      .post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new lang
        agent
          .post('/api/langs')
          .send(lang)
          .expect(200)
          .end(function (langSaveErr, langSaveRes) {
            // Handle lang save error
            if (langSaveErr) {
              return done(langSaveErr);
            }

            // Update lang title
            lang.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing lang
            agent
              .put('/api/langs/' + langSaveRes.body._id)
              .send(lang)
              .expect(200)
              .end(function (langUpdateErr, langUpdateRes) {
                // Handle lang update error
                if (langUpdateErr) {
                  return done(langUpdateErr);
                }

                // Set assertions
                langUpdateRes.body._id.should.equal(langSaveRes.body._id);
                langUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an lang if no title is provided', function (done) {
    // Invalidate title field
    lang.title = '';

    agent
      .post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new lang
        agent
          .post('/api/langs')
          .send(lang)
          .expect(422)
          .end(function (langSaveErr, langSaveRes) {
            // Set message assertion
            langSaveRes.body.message.should.match('Title cannot be blank');

            // Handle lang save error
            done(langSaveErr);
          });
      });
  });

  it('should be able to delete an lang if signed in', function (done) {
    agent
      .post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new lang
        agent
          .post('/api/langs')
          .send(lang)
          .expect(200)
          .end(function (langSaveErr, langSaveRes) {
            // Handle lang save error
            if (langSaveErr) {
              return done(langSaveErr);
            }

            // Delete an existing lang
            agent
              .delete('/api/langs/' + langSaveRes.body._id)
              .send(lang)
              .expect(200)
              .end(function (langDeleteErr, langDeleteRes) {
                // Handle lang error error
                if (langDeleteErr) {
                  return done(langDeleteErr);
                }

                // Set assertions
                langDeleteRes.body._id.should.equal(langSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single lang if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new lang model instance
    lang.user = user;
    var langObj = new Lang(lang);

    agent
      .post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new lang
        agent
          .post('/api/langs')
          .send(lang)
          .expect(200)
          .end(function (langSaveErr, langSaveRes) {
            // Handle lang save error
            if (langSaveErr) {
              return done(langSaveErr);
            }

            // Get the lang
            agent
              .get('/api/langs/' + langSaveRes.body._id)
              .expect(200)
              .end(function (langInfoErr, langInfoRes) {
                // Handle lang error
                if (langInfoErr) {
                  return done(langInfoErr);
                }

                // Set assertions
                langInfoRes.body._id.should.equal(langSaveRes.body._id);
                langInfoRes.body.title.should.equal(lang.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                langInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Lang.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
