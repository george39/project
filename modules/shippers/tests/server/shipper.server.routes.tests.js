'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Shipper = mongoose.model('Shipper');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var shipper;

/**
 * Shipper routes tests
 */
describe('Shipper CRUD tests', function () {
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

    // Save a user to the test db and create new shipper
    user
      .save()
      .then(function () {
        shipper = {
          title: 'Shipper Title',
          content: 'Shipper Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an shipper if logged in without the "admin" role', function (done) {
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
          .post('/api/shippers')
          .send(shipper)
          .expect(403)
          .end(function (shipperSaveErr, shipperSaveRes) {
            // Call the assertion callback
            done(shipperSaveErr);
          });
      });
  });

  it('should not be able to save an shipper if not logged in', function (done) {
    agent
      .post('/api/shippers')
      .send(shipper)
      .expect(403)
      .end(function (shipperSaveErr, shipperSaveRes) {
        // Call the assertion callback
        done(shipperSaveErr);
      });
  });

  it('should not be able to update an shipper if signed in without the "admin" role', function (done) {
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
          .post('/api/shippers')
          .send(shipper)
          .expect(403)
          .end(function (shipperSaveErr, shipperSaveRes) {
            // Call the assertion callback
            done(shipperSaveErr);
          });
      });
  });

  it('should be able to get a list of shippers if not signed in', function (done) {
    // Create new shipper model instance
    var shipperObj = new Shipper(shipper);

    // Save the shipper
    shipperObj.save(function () {
      // Request shippers
      agent.get('/api/shippers').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single shipper if not signed in', function (done) {
    // Create new shipper model instance
    var shipperObj = new Shipper(shipper);

    // Save the shipper
    shipperObj.save(function () {
      agent.get('/api/shippers/' + shipperObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', shipper.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single shipper with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/shippers/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Shipper is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single shipper which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent shipper
    agent.get('/api/shippers/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No shipper with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an shipper if signed in without the "admin" role', function (done) {
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
          .post('/api/shippers')
          .send(shipper)
          .expect(403)
          .end(function (shipperSaveErr, shipperSaveRes) {
            // Call the assertion callback
            done(shipperSaveErr);
          });
      });
  });

  it('should not be able to delete an shipper if not signed in', function (done) {
    // Set shipper user
    shipper.user = user;

    // Create new shipper model instance
    var shipperObj = new Shipper(shipper);

    // Save the shipper
    shipperObj.save(function () {
      // Try deleting shipper
      agent
        .delete('/api/shippers/' + shipperObj._id)
        .expect(403)
        .end(function (shipperDeleteErr, shipperDeleteRes) {
          // Set message assertion
          shipperDeleteRes.body.message.should.match('User is not authorized');

          // Handle shipper error error
          done(shipperDeleteErr);
        });
    });
  });

  it('should be able to get a single shipper that has an orphaned user reference', function (done) {
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

          // Save a new shipper
          agent
            .post('/api/shippers')
            .send(shipper)
            .expect(200)
            .end(function (shipperSaveErr, shipperSaveRes) {
              // Handle shipper save error
              if (shipperSaveErr) {
                return done(shipperSaveErr);
              }

              // Set assertions on new shipper
              shipperSaveRes.body.title.should.equal(shipper.title);
              should.exist(shipperSaveRes.body.user);
              should.equal(shipperSaveRes.body.user._id, orphanId);

              // force the shipper to have an orphaned user reference
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

                    // Get the shipper
                    agent
                      .get('/api/shippers/' + shipperSaveRes.body._id)
                      .expect(200)
                      .end(function (shipperInfoErr, shipperInfoRes) {
                        // Handle shipper error
                        if (shipperInfoErr) {
                          return done(shipperInfoErr);
                        }

                        // Set assertions
                        shipperInfoRes.body._id.should.equal(shipperSaveRes.body._id);
                        shipperInfoRes.body.title.should.equal(shipper.title);
                        should.equal(shipperInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single shipper if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new shipper model instance
    var shipperObj = new Shipper(shipper);

    // Save the shipper
    shipperObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/shippers/' + shipperObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', shipper.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single shipper, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'shipperowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Shipper
    var _shipperOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _shipperOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Shipper
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

          // Save a new shipper
          agent
            .post('/api/shippers')
            .send(shipper)
            .expect(200)
            .end(function (shipperSaveErr, shipperSaveRes) {
              // Handle shipper save error
              if (shipperSaveErr) {
                return done(shipperSaveErr);
              }

              // Set assertions on new shipper
              shipperSaveRes.body.title.should.equal(shipper.title);
              should.exist(shipperSaveRes.body.user);
              should.equal(shipperSaveRes.body.user._id, userId);

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

                  // Get the shipper
                  agent
                    .get('/api/shippers/' + shipperSaveRes.body._id)
                    .expect(200)
                    .end(function (shipperInfoErr, shipperInfoRes) {
                      // Handle shipper error
                      if (shipperInfoErr) {
                        return done(shipperInfoErr);
                      }

                      // Set assertions
                      shipperInfoRes.body._id.should.equal(shipperSaveRes.body._id);
                      shipperInfoRes.body.title.should.equal(shipper.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      shipperInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Shipper.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
