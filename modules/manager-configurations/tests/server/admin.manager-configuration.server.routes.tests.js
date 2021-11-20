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
describe('ManagerConfiguration Admin CRUD tests', function () {
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

  it('should be able to save an managerConfiguration if logged in', function (done) {
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

            // Get a list of managerConfigurations
            agent.get('/api/managerConfigurations').end(function (managerConfigurationsGetErr, managerConfigurationsGetRes) {
              // Handle managerConfiguration save error
              if (managerConfigurationsGetErr) {
                return done(managerConfigurationsGetErr);
              }

              // Get managerConfigurations list
              var managerConfigurations = managerConfigurationsGetRes.body;

              // Set assertions
              managerConfigurations[0].user._id.should.equal(userId);
              managerConfigurations[0].title.should.match('ManagerConfiguration Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an managerConfiguration if signed in', function (done) {
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

            // Update managerConfiguration title
            managerConfiguration.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing managerConfiguration
            agent
              .put('/api/managerConfigurations/' + managerConfigurationSaveRes.body._id)
              .send(managerConfiguration)
              .expect(200)
              .end(function (managerConfigurationUpdateErr, managerConfigurationUpdateRes) {
                // Handle managerConfiguration update error
                if (managerConfigurationUpdateErr) {
                  return done(managerConfigurationUpdateErr);
                }

                // Set assertions
                managerConfigurationUpdateRes.body._id.should.equal(managerConfigurationSaveRes.body._id);
                managerConfigurationUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an managerConfiguration if no title is provided', function (done) {
    // Invalidate title field
    managerConfiguration.title = '';

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

        // Save a new managerConfiguration
        agent
          .post('/api/managerConfigurations')
          .send(managerConfiguration)
          .expect(422)
          .end(function (managerConfigurationSaveErr, managerConfigurationSaveRes) {
            // Set message assertion
            managerConfigurationSaveRes.body.message.should.match('Title cannot be blank');

            // Handle managerConfiguration save error
            done(managerConfigurationSaveErr);
          });
      });
  });

  it('should be able to delete an managerConfiguration if signed in', function (done) {
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

            // Delete an existing managerConfiguration
            agent
              .delete('/api/managerConfigurations/' + managerConfigurationSaveRes.body._id)
              .send(managerConfiguration)
              .expect(200)
              .end(function (managerConfigurationDeleteErr, managerConfigurationDeleteRes) {
                // Handle managerConfiguration error error
                if (managerConfigurationDeleteErr) {
                  return done(managerConfigurationDeleteErr);
                }

                // Set assertions
                managerConfigurationDeleteRes.body._id.should.equal(managerConfigurationSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single managerConfiguration if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new managerConfiguration model instance
    managerConfiguration.user = user;
    var managerConfigurationObj = new ManagerConfiguration(managerConfiguration);

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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                managerConfigurationInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    ManagerConfiguration.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
