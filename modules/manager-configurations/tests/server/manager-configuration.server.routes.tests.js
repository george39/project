'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var ManagerConfiguration = mongoose.model('ManagerConfiguration');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var managerConfiguration;

/**
 * ManagerConfiguration routes tests
 */
describe('ManagerConfiguration CRUD tests', function () {
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

    // Save a user to the test db and create new managerConfiguration
    user
      .save()
      .then(function () {
        managerConfiguration = {
          title: 'ManagerConfiguration Title',
          content: 'ManagerConfiguration Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an managerConfiguration if logged in without the "admin" role', function (done) {
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
          .post('/api/managerConfigurations')
          .send(managerConfiguration)
          .expect(403)
          .end(function (managerConfigurationSaveErr, managerConfigurationSaveRes) {
            // Call the assertion callback
            done(managerConfigurationSaveErr);
          });
      });
  });

  it('should not be able to save an managerConfiguration if not logged in', function (done) {
    agent
      .post('/api/managerConfigurations')
      .send(managerConfiguration)
      .expect(403)
      .end(function (managerConfigurationSaveErr, managerConfigurationSaveRes) {
        // Call the assertion callback
        done(managerConfigurationSaveErr);
      });
  });

  it('should not be able to update an managerConfiguration if signed in without the "admin" role', function (done) {
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
          .post('/api/managerConfigurations')
          .send(managerConfiguration)
          .expect(403)
          .end(function (managerConfigurationSaveErr, managerConfigurationSaveRes) {
            // Call the assertion callback
            done(managerConfigurationSaveErr);
          });
      });
  });

  it('should be able to get a list of managerConfigurations if not signed in', function (done) {
    // Create new managerConfiguration model instance
    var managerConfigurationObj = new ManagerConfiguration(managerConfiguration);

    // Save the managerConfiguration
    managerConfigurationObj.save(function () {
      // Request managerConfigurations
      agent.get('/api/managerConfigurations').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single managerConfiguration if not signed in', function (done) {
    // Create new managerConfiguration model instance
    var managerConfigurationObj = new ManagerConfiguration(managerConfiguration);

    // Save the managerConfiguration
    managerConfigurationObj.save(function () {
      agent.get('/api/managerConfigurations/' + managerConfigurationObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', managerConfiguration.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single managerConfiguration with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/managerConfigurations/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'ManagerConfiguration is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single managerConfiguration which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent managerConfiguration
    agent.get('/api/managerConfigurations/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No managerConfiguration with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an managerConfiguration if signed in without the "admin" role', function (done) {
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
          .post('/api/managerConfigurations')
          .send(managerConfiguration)
          .expect(403)
          .end(function (managerConfigurationSaveErr, managerConfigurationSaveRes) {
            // Call the assertion callback
            done(managerConfigurationSaveErr);
          });
      });
  });

  it('should not be able to delete an managerConfiguration if not signed in', function (done) {
    // Set managerConfiguration user
    managerConfiguration.user = user;

    // Create new managerConfiguration model instance
    var managerConfigurationObj = new ManagerConfiguration(managerConfiguration);

    // Save the managerConfiguration
    managerConfigurationObj.save(function () {
      // Try deleting managerConfiguration
      agent
        .delete('/api/managerConfigurations/' + managerConfigurationObj._id)
        .expect(403)
        .end(function (managerConfigurationDeleteErr, managerConfigurationDeleteRes) {
          // Set message assertion
          managerConfigurationDeleteRes.body.message.should.match('User is not authorized');

          // Handle managerConfiguration error error
          done(managerConfigurationDeleteErr);
        });
    });
  });

  it('should be able to get a single managerConfiguration that has an orphaned user reference', function (done) {
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

          // Save a new managerConfiguration
          agent
            .post('/api/managerConfigurations')
            .send(managerConfiguration)
            .expect(200)
            .end(function (managerConfigurationSaveErr, managerConfigurationSaveRes) {
              // Handle managerConfiguration save error
              if (managerConfigurationSaveErr) {
                return done(managerConfigurationSaveErr);
              }

              // Set assertions on new managerConfiguration
              managerConfigurationSaveRes.body.title.should.equal(managerConfiguration.title);
              should.exist(managerConfigurationSaveRes.body.user);
              should.equal(managerConfigurationSaveRes.body.user._id, orphanId);

              // force the managerConfiguration to have an orphaned user reference
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

                    // Get the managerConfiguration
                    agent
                      .get('/api/managerConfigurations/' + managerConfigurationSaveRes.body._id)
                      .expect(200)
                      .end(function (managerConfigurationInfoErr, managerConfigurationInfoRes) {
                        // Handle managerConfiguration error
                        if (managerConfigurationInfoErr) {
                          return done(managerConfigurationInfoErr);
                        }

                        // Set assertions
                        managerConfigurationInfoRes.body._id.should.equal(managerConfigurationSaveRes.body._id);
                        managerConfigurationInfoRes.body.title.should.equal(managerConfiguration.title);
                        should.equal(managerConfigurationInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single managerConfiguration if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new managerConfiguration model instance
    var managerConfigurationObj = new ManagerConfiguration(managerConfiguration);

    // Save the managerConfiguration
    managerConfigurationObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/managerConfigurations/' + managerConfigurationObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', managerConfiguration.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single managerConfiguration, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'managerConfigurationowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the ManagerConfiguration
    var _managerConfigurationOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _managerConfigurationOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the ManagerConfiguration
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

          // Save a new managerConfiguration
          agent
            .post('/api/managerConfigurations')
            .send(managerConfiguration)
            .expect(200)
            .end(function (managerConfigurationSaveErr, managerConfigurationSaveRes) {
              // Handle managerConfiguration save error
              if (managerConfigurationSaveErr) {
                return done(managerConfigurationSaveErr);
              }

              // Set assertions on new managerConfiguration
              managerConfigurationSaveRes.body.title.should.equal(managerConfiguration.title);
              should.exist(managerConfigurationSaveRes.body.user);
              should.equal(managerConfigurationSaveRes.body.user._id, userId);

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

                  // Get the managerConfiguration
                  agent
                    .get('/api/managerConfigurations/' + managerConfigurationSaveRes.body._id)
                    .expect(200)
                    .end(function (managerConfigurationInfoErr, managerConfigurationInfoRes) {
                      // Handle managerConfiguration error
                      if (managerConfigurationInfoErr) {
                        return done(managerConfigurationInfoErr);
                      }

                      // Set assertions
                      managerConfigurationInfoRes.body._id.should.equal(managerConfigurationSaveRes.body._id);
                      managerConfigurationInfoRes.body.title.should.equal(managerConfiguration.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      managerConfigurationInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    ManagerConfiguration.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
