'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Third = mongoose.model('Third');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var third;

/**
 * Third routes tests
 */
describe('Third Admin CRUD tests', function () {
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

    // Save a user to the test db and create new third
    user
      .save()
      .then(function () {
        third = {
          title: 'Third Title',
          content: 'Third Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an third if logged in', function (done) {
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

        // Save a new third
        agent
          .post('/api/thirds')
          .send(third)
          .expect(200)
          .end(function (thirdSaveErr, thirdSaveRes) {
            // Handle third save error
            if (thirdSaveErr) {
              return done(thirdSaveErr);
            }

            // Get a list of thirds
            agent.get('/api/thirds').end(function (thirdsGetErr, thirdsGetRes) {
              // Handle third save error
              if (thirdsGetErr) {
                return done(thirdsGetErr);
              }

              // Get thirds list
              var thirds = thirdsGetRes.body;

              // Set assertions
              thirds[0].user._id.should.equal(userId);
              thirds[0].title.should.match('Third Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an third if signed in', function (done) {
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

        // Save a new third
        agent
          .post('/api/thirds')
          .send(third)
          .expect(200)
          .end(function (thirdSaveErr, thirdSaveRes) {
            // Handle third save error
            if (thirdSaveErr) {
              return done(thirdSaveErr);
            }

            // Update third title
            third.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing third
            agent
              .put('/api/thirds/' + thirdSaveRes.body._id)
              .send(third)
              .expect(200)
              .end(function (thirdUpdateErr, thirdUpdateRes) {
                // Handle third update error
                if (thirdUpdateErr) {
                  return done(thirdUpdateErr);
                }

                // Set assertions
                thirdUpdateRes.body._id.should.equal(thirdSaveRes.body._id);
                thirdUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an third if no title is provided', function (done) {
    // Invalidate title field
    third.title = '';

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

        // Save a new third
        agent
          .post('/api/thirds')
          .send(third)
          .expect(422)
          .end(function (thirdSaveErr, thirdSaveRes) {
            // Set message assertion
            thirdSaveRes.body.message.should.match('Title cannot be blank');

            // Handle third save error
            done(thirdSaveErr);
          });
      });
  });

  it('should be able to delete an third if signed in', function (done) {
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

        // Save a new third
        agent
          .post('/api/thirds')
          .send(third)
          .expect(200)
          .end(function (thirdSaveErr, thirdSaveRes) {
            // Handle third save error
            if (thirdSaveErr) {
              return done(thirdSaveErr);
            }

            // Delete an existing third
            agent
              .delete('/api/thirds/' + thirdSaveRes.body._id)
              .send(third)
              .expect(200)
              .end(function (thirdDeleteErr, thirdDeleteRes) {
                // Handle third error error
                if (thirdDeleteErr) {
                  return done(thirdDeleteErr);
                }

                // Set assertions
                thirdDeleteRes.body._id.should.equal(thirdSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single third if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new third model instance
    third.user = user;
    var thirdObj = new Third(third);

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

        // Save a new third
        agent
          .post('/api/thirds')
          .send(third)
          .expect(200)
          .end(function (thirdSaveErr, thirdSaveRes) {
            // Handle third save error
            if (thirdSaveErr) {
              return done(thirdSaveErr);
            }

            // Get the third
            agent
              .get('/api/thirds/' + thirdSaveRes.body._id)
              .expect(200)
              .end(function (thirdInfoErr, thirdInfoRes) {
                // Handle third error
                if (thirdInfoErr) {
                  return done(thirdInfoErr);
                }

                // Set assertions
                thirdInfoRes.body._id.should.equal(thirdSaveRes.body._id);
                thirdInfoRes.body.title.should.equal(third.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                thirdInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Third.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
