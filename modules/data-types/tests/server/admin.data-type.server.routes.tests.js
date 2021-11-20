'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var DataType = mongoose.model('DataType');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var dataType;

/**
 * DataType routes tests
 */
describe('DataType Admin CRUD tests', function () {
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

    // Save a user to the test db and create new dataType
    user
      .save()
      .then(function () {
        dataType = {
          title: 'DataType Title',
          content: 'DataType Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an dataType if logged in', function (done) {
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

        // Save a new dataType
        agent
          .post('/api/dataTypes')
          .send(dataType)
          .expect(200)
          .end(function (dataTypeSaveErr, dataTypeSaveRes) {
            // Handle dataType save error
            if (dataTypeSaveErr) {
              return done(dataTypeSaveErr);
            }

            // Get a list of dataTypes
            agent.get('/api/dataTypes').end(function (dataTypesGetErr, dataTypesGetRes) {
              // Handle dataType save error
              if (dataTypesGetErr) {
                return done(dataTypesGetErr);
              }

              // Get dataTypes list
              var dataTypes = dataTypesGetRes.body;

              // Set assertions
              dataTypes[0].user._id.should.equal(userId);
              dataTypes[0].title.should.match('DataType Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an dataType if signed in', function (done) {
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

        // Save a new dataType
        agent
          .post('/api/dataTypes')
          .send(dataType)
          .expect(200)
          .end(function (dataTypeSaveErr, dataTypeSaveRes) {
            // Handle dataType save error
            if (dataTypeSaveErr) {
              return done(dataTypeSaveErr);
            }

            // Update dataType title
            dataType.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing dataType
            agent
              .put('/api/dataTypes/' + dataTypeSaveRes.body._id)
              .send(dataType)
              .expect(200)
              .end(function (dataTypeUpdateErr, dataTypeUpdateRes) {
                // Handle dataType update error
                if (dataTypeUpdateErr) {
                  return done(dataTypeUpdateErr);
                }

                // Set assertions
                dataTypeUpdateRes.body._id.should.equal(dataTypeSaveRes.body._id);
                dataTypeUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an dataType if no title is provided', function (done) {
    // Invalidate title field
    dataType.title = '';

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

        // Save a new dataType
        agent
          .post('/api/dataTypes')
          .send(dataType)
          .expect(422)
          .end(function (dataTypeSaveErr, dataTypeSaveRes) {
            // Set message assertion
            dataTypeSaveRes.body.message.should.match('Title cannot be blank');

            // Handle dataType save error
            done(dataTypeSaveErr);
          });
      });
  });

  it('should be able to delete an dataType if signed in', function (done) {
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

        // Save a new dataType
        agent
          .post('/api/dataTypes')
          .send(dataType)
          .expect(200)
          .end(function (dataTypeSaveErr, dataTypeSaveRes) {
            // Handle dataType save error
            if (dataTypeSaveErr) {
              return done(dataTypeSaveErr);
            }

            // Delete an existing dataType
            agent
              .delete('/api/dataTypes/' + dataTypeSaveRes.body._id)
              .send(dataType)
              .expect(200)
              .end(function (dataTypeDeleteErr, dataTypeDeleteRes) {
                // Handle dataType error error
                if (dataTypeDeleteErr) {
                  return done(dataTypeDeleteErr);
                }

                // Set assertions
                dataTypeDeleteRes.body._id.should.equal(dataTypeSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single dataType if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new dataType model instance
    dataType.user = user;
    var dataTypeObj = new DataType(dataType);

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

        // Save a new dataType
        agent
          .post('/api/dataTypes')
          .send(dataType)
          .expect(200)
          .end(function (dataTypeSaveErr, dataTypeSaveRes) {
            // Handle dataType save error
            if (dataTypeSaveErr) {
              return done(dataTypeSaveErr);
            }

            // Get the dataType
            agent
              .get('/api/dataTypes/' + dataTypeSaveRes.body._id)
              .expect(200)
              .end(function (dataTypeInfoErr, dataTypeInfoRes) {
                // Handle dataType error
                if (dataTypeInfoErr) {
                  return done(dataTypeInfoErr);
                }

                // Set assertions
                dataTypeInfoRes.body._id.should.equal(dataTypeSaveRes.body._id);
                dataTypeInfoRes.body.title.should.equal(dataType.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                dataTypeInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    DataType.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
