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
describe('Third CRUD tests', function () {
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

  it('should not be able to save an third if logged in without the "admin" role', function (done) {
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
          .post('/api/thirds')
          .send(third)
          .expect(403)
          .end(function (thirdSaveErr, thirdSaveRes) {
            // Call the assertion callback
            done(thirdSaveErr);
          });
      });
  });

  it('should not be able to save an third if not logged in', function (done) {
    agent
      .post('/api/thirds')
      .send(third)
      .expect(403)
      .end(function (thirdSaveErr, thirdSaveRes) {
        // Call the assertion callback
        done(thirdSaveErr);
      });
  });

  it('should not be able to update an third if signed in without the "admin" role', function (done) {
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
          .post('/api/thirds')
          .send(third)
          .expect(403)
          .end(function (thirdSaveErr, thirdSaveRes) {
            // Call the assertion callback
            done(thirdSaveErr);
          });
      });
  });

  it('should be able to get a list of thirds if not signed in', function (done) {
    // Create new third model instance
    var thirdObj = new Third(third);

    // Save the third
    thirdObj.save(function () {
      // Request thirds
      agent.get('/api/thirds').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single third if not signed in', function (done) {
    // Create new third model instance
    var thirdObj = new Third(third);

    // Save the third
    thirdObj.save(function () {
      agent.get('/api/thirds/' + thirdObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', third.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single third with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/thirds/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Third is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single third which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent third
    agent.get('/api/thirds/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No third with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an third if signed in without the "admin" role', function (done) {
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
          .post('/api/thirds')
          .send(third)
          .expect(403)
          .end(function (thirdSaveErr, thirdSaveRes) {
            // Call the assertion callback
            done(thirdSaveErr);
          });
      });
  });

  it('should not be able to delete an third if not signed in', function (done) {
    // Set third user
    third.user = user;

    // Create new third model instance
    var thirdObj = new Third(third);

    // Save the third
    thirdObj.save(function () {
      // Try deleting third
      agent
        .delete('/api/thirds/' + thirdObj._id)
        .expect(403)
        .end(function (thirdDeleteErr, thirdDeleteRes) {
          // Set message assertion
          thirdDeleteRes.body.message.should.match('User is not authorized');

          // Handle third error error
          done(thirdDeleteErr);
        });
    });
  });

  it('should be able to get a single third that has an orphaned user reference', function (done) {
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

              // Set assertions on new third
              thirdSaveRes.body.title.should.equal(third.title);
              should.exist(thirdSaveRes.body.user);
              should.equal(thirdSaveRes.body.user._id, orphanId);

              // force the third to have an orphaned user reference
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
                        should.equal(thirdInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single third if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new third model instance
    var thirdObj = new Third(third);

    // Save the third
    thirdObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/thirds/' + thirdObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', third.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single third, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'thirdowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Third
    var _thirdOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _thirdOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Third
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

              // Set assertions on new third
              thirdSaveRes.body.title.should.equal(third.title);
              should.exist(thirdSaveRes.body.user);
              should.equal(thirdSaveRes.body.user._id, userId);

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
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      thirdInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Third.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
