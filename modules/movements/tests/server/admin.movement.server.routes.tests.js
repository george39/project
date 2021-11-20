'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Movement = mongoose.model('Movement');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var movement;

/**
 * Movement routes tests
 */
describe('Movement Admin CRUD tests', function () {
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

    // Save a user to the test db and create new movement
    user
      .save()
      .then(function () {
        movement = {
          title: 'Movement Title',
          content: 'Movement Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an movement if logged in', function (done) {
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

        // Save a new movement
        agent
          .post('/api/movements')
          .send(movement)
          .expect(200)
          .end(function (movementSaveErr, movementSaveRes) {
            // Handle movement save error
            if (movementSaveErr) {
              return done(movementSaveErr);
            }

            // Get a list of movements
            agent.get('/api/movements').end(function (movementsGetErr, movementsGetRes) {
              // Handle movement save error
              if (movementsGetErr) {
                return done(movementsGetErr);
              }

              // Get movements list
              var movements = movementsGetRes.body;

              // Set assertions
              movements[0].user._id.should.equal(userId);
              movements[0].title.should.match('Movement Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an movement if signed in', function (done) {
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

        // Save a new movement
        agent
          .post('/api/movements')
          .send(movement)
          .expect(200)
          .end(function (movementSaveErr, movementSaveRes) {
            // Handle movement save error
            if (movementSaveErr) {
              return done(movementSaveErr);
            }

            // Update movement title
            movement.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing movement
            agent
              .put('/api/movements/' + movementSaveRes.body._id)
              .send(movement)
              .expect(200)
              .end(function (movementUpdateErr, movementUpdateRes) {
                // Handle movement update error
                if (movementUpdateErr) {
                  return done(movementUpdateErr);
                }

                // Set assertions
                movementUpdateRes.body._id.should.equal(movementSaveRes.body._id);
                movementUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an movement if no title is provided', function (done) {
    // Invalidate title field
    movement.title = '';

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

        // Save a new movement
        agent
          .post('/api/movements')
          .send(movement)
          .expect(422)
          .end(function (movementSaveErr, movementSaveRes) {
            // Set message assertion
            movementSaveRes.body.message.should.match('Title cannot be blank');

            // Handle movement save error
            done(movementSaveErr);
          });
      });
  });

  it('should be able to delete an movement if signed in', function (done) {
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

        // Save a new movement
        agent
          .post('/api/movements')
          .send(movement)
          .expect(200)
          .end(function (movementSaveErr, movementSaveRes) {
            // Handle movement save error
            if (movementSaveErr) {
              return done(movementSaveErr);
            }

            // Delete an existing movement
            agent
              .delete('/api/movements/' + movementSaveRes.body._id)
              .send(movement)
              .expect(200)
              .end(function (movementDeleteErr, movementDeleteRes) {
                // Handle movement error error
                if (movementDeleteErr) {
                  return done(movementDeleteErr);
                }

                // Set assertions
                movementDeleteRes.body._id.should.equal(movementSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single movement if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new movement model instance
    movement.user = user;
    var movementObj = new Movement(movement);

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

        // Save a new movement
        agent
          .post('/api/movements')
          .send(movement)
          .expect(200)
          .end(function (movementSaveErr, movementSaveRes) {
            // Handle movement save error
            if (movementSaveErr) {
              return done(movementSaveErr);
            }

            // Get the movement
            agent
              .get('/api/movements/' + movementSaveRes.body._id)
              .expect(200)
              .end(function (movementInfoErr, movementInfoRes) {
                // Handle movement error
                if (movementInfoErr) {
                  return done(movementInfoErr);
                }

                // Set assertions
                movementInfoRes.body._id.should.equal(movementSaveRes.body._id);
                movementInfoRes.body.title.should.equal(movement.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                movementInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Movement.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
