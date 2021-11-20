'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var DiscountMassive = mongoose.model('DiscountMassive');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var discountMassive;

/**
 * DiscountMassive routes tests
 */
describe('DiscountMassive CRUD tests', function () {
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

    // Save a user to the test db and create new discountMassive
    user
      .save()
      .then(function () {
        discountMassive = {
          title: 'DiscountMassive Title',
          content: 'DiscountMassive Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an discountMassive if logged in without the "admin" role', function (done) {
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
          .post('/api/discountMassives')
          .send(discountMassive)
          .expect(403)
          .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
            // Call the assertion callback
            done(discountMassiveSaveErr);
          });
      });
  });

  it('should not be able to save an discountMassive if not logged in', function (done) {
    agent
      .post('/api/discountMassives')
      .send(discountMassive)
      .expect(403)
      .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
        // Call the assertion callback
        done(discountMassiveSaveErr);
      });
  });

  it('should not be able to update an discountMassive if signed in without the "admin" role', function (done) {
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
          .post('/api/discountMassives')
          .send(discountMassive)
          .expect(403)
          .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
            // Call the assertion callback
            done(discountMassiveSaveErr);
          });
      });
  });

  it('should be able to get a list of discountMassives if not signed in', function (done) {
    // Create new discountMassive model instance
    var discountMassiveObj = new DiscountMassive(discountMassive);

    // Save the discountMassive
    discountMassiveObj.save(function () {
      // Request discountMassives
      agent.get('/api/discountMassives').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single discountMassive if not signed in', function (done) {
    // Create new discountMassive model instance
    var discountMassiveObj = new DiscountMassive(discountMassive);

    // Save the discountMassive
    discountMassiveObj.save(function () {
      agent.get('/api/discountMassives/' + discountMassiveObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', discountMassive.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single discountMassive with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/discountMassives/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'DiscountMassive is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single discountMassive which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent discountMassive
    agent.get('/api/discountMassives/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No discountMassive with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an discountMassive if signed in without the "admin" role', function (done) {
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
          .post('/api/discountMassives')
          .send(discountMassive)
          .expect(403)
          .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
            // Call the assertion callback
            done(discountMassiveSaveErr);
          });
      });
  });

  it('should not be able to delete an discountMassive if not signed in', function (done) {
    // Set discountMassive user
    discountMassive.user = user;

    // Create new discountMassive model instance
    var discountMassiveObj = new DiscountMassive(discountMassive);

    // Save the discountMassive
    discountMassiveObj.save(function () {
      // Try deleting discountMassive
      agent
        .delete('/api/discountMassives/' + discountMassiveObj._id)
        .expect(403)
        .end(function (discountMassiveDeleteErr, discountMassiveDeleteRes) {
          // Set message assertion
          discountMassiveDeleteRes.body.message.should.match('User is not authorized');

          // Handle discountMassive error error
          done(discountMassiveDeleteErr);
        });
    });
  });

  it('should be able to get a single discountMassive that has an orphaned user reference', function (done) {
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

          // Save a new discountMassive
          agent
            .post('/api/discountMassives')
            .send(discountMassive)
            .expect(200)
            .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
              // Handle discountMassive save error
              if (discountMassiveSaveErr) {
                return done(discountMassiveSaveErr);
              }

              // Set assertions on new discountMassive
              discountMassiveSaveRes.body.title.should.equal(discountMassive.title);
              should.exist(discountMassiveSaveRes.body.user);
              should.equal(discountMassiveSaveRes.body.user._id, orphanId);

              // force the discountMassive to have an orphaned user reference
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

                    // Get the discountMassive
                    agent
                      .get('/api/discountMassives/' + discountMassiveSaveRes.body._id)
                      .expect(200)
                      .end(function (discountMassiveInfoErr, discountMassiveInfoRes) {
                        // Handle discountMassive error
                        if (discountMassiveInfoErr) {
                          return done(discountMassiveInfoErr);
                        }

                        // Set assertions
                        discountMassiveInfoRes.body._id.should.equal(discountMassiveSaveRes.body._id);
                        discountMassiveInfoRes.body.title.should.equal(discountMassive.title);
                        should.equal(discountMassiveInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single discountMassive if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new discountMassive model instance
    var discountMassiveObj = new DiscountMassive(discountMassive);

    // Save the discountMassive
    discountMassiveObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/discountMassives/' + discountMassiveObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', discountMassive.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single discountMassive, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'discountMassiveowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the DiscountMassive
    var _discountMassiveOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _discountMassiveOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the DiscountMassive
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

          // Save a new discountMassive
          agent
            .post('/api/discountMassives')
            .send(discountMassive)
            .expect(200)
            .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
              // Handle discountMassive save error
              if (discountMassiveSaveErr) {
                return done(discountMassiveSaveErr);
              }

              // Set assertions on new discountMassive
              discountMassiveSaveRes.body.title.should.equal(discountMassive.title);
              should.exist(discountMassiveSaveRes.body.user);
              should.equal(discountMassiveSaveRes.body.user._id, userId);

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

                  // Get the discountMassive
                  agent
                    .get('/api/discountMassives/' + discountMassiveSaveRes.body._id)
                    .expect(200)
                    .end(function (discountMassiveInfoErr, discountMassiveInfoRes) {
                      // Handle discountMassive error
                      if (discountMassiveInfoErr) {
                        return done(discountMassiveInfoErr);
                      }

                      // Set assertions
                      discountMassiveInfoRes.body._id.should.equal(discountMassiveSaveRes.body._id);
                      discountMassiveInfoRes.body.title.should.equal(discountMassive.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      discountMassiveInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    DiscountMassive.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
