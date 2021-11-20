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
describe('Movement CRUD tests', function () {
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

  it('should not be able to save an movement if logged in without the "admin" role', function (done) {
    agent
      .post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent
          .post('/api/movements')
          .send(movement)
          .expect(403)
          .end(function (movementSaveErr, movementSaveRes) {
            // Call the assertion callback
            done(movementSaveErr);
          });
      });
  });

  it('should not be able to save an movement if not logged in', function (done) {
    agent
      .post('/api/movements')
      .send(movement)
      .expect(403)
      .end(function (movementSaveErr, movementSaveRes) {
        // Call the assertion callback
        done(movementSaveErr);
      });
  });

  it('should not be able to update an movement if signed in without the "admin" role', function (done) {
    agent
      .post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent
          .post('/api/movements')
          .send(movement)
          .expect(403)
          .end(function (movementSaveErr, movementSaveRes) {
            // Call the assertion callback
            done(movementSaveErr);
          });
      });
  });

  it('should be able to get a list of movements if not signed in', function (done) {
    // Create new movement model instance
    var movementObj = new Movement(movement);

    // Save the movement
    movementObj.save(function () {
      // Request movements
      agent.get('/api/movements').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single movement if not signed in', function (done) {
    // Create new movement model instance
    var movementObj = new Movement(movement);

    // Save the movement
    movementObj.save(function () {
      agent.get('/api/movements/' + movementObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', movement.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single movement with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/movements/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Movement is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single movement which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent movement
    agent.get('/api/movements/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No movement with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an movement if signed in without the "admin" role', function (done) {
    agent
      .post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent
          .post('/api/movements')
          .send(movement)
          .expect(403)
          .end(function (movementSaveErr, movementSaveRes) {
            // Call the assertion callback
            done(movementSaveErr);
          });
      });
  });

  it('should not be able to delete an movement if not signed in', function (done) {
    // Set movement user
    movement.user = user;

    // Create new movement model instance
    var movementObj = new Movement(movement);

    // Save the movement
    movementObj.save(function () {
      // Try deleting movement
      agent
        .delete('/api/movements/' + movementObj._id)
        .expect(403)
        .end(function (movementDeleteErr, movementDeleteRes) {
          // Set message assertion
          movementDeleteRes.body.message.should.match('User is not authorized');

          // Handle movement error error
          done(movementDeleteErr);
        });
    });
  });

  it('should be able to get a single movement that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      usernameOrEmail: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin']
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent
        .post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

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

              // Set assertions on new movement
              movementSaveRes.body.title.should.equal(movement.title);
              should.exist(movementSaveRes.body.user);
              should.equal(movementSaveRes.body.user._id, orphanId);

              // force the movement to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent
                  .post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
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
                        should.equal(movementInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single movement if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new movement model instance
    var movementObj = new Movement(movement);

    // Save the movement
    movementObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/movements/' + movementObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', movement.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single movement, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'movementowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Movement
    var _movementOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _movementOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Movement
      agent
        .post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

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

              // Set assertions on new movement
              movementSaveRes.body.title.should.equal(movement.title);
              should.exist(movementSaveRes.body.user);
              should.equal(movementSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent
                .post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
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
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      movementInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Movement.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
