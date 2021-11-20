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
describe('DataType CRUD tests', function () {
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

  it('should not be able to save an dataType if logged in without the "admin" role', function (done) {
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
          .post('/api/dataTypes')
          .send(dataType)
          .expect(403)
          .end(function (dataTypeSaveErr, dataTypeSaveRes) {
            // Call the assertion callback
            done(dataTypeSaveErr);
          });
      });
  });

  it('should not be able to save an dataType if not logged in', function (done) {
    agent
      .post('/api/dataTypes')
      .send(dataType)
      .expect(403)
      .end(function (dataTypeSaveErr, dataTypeSaveRes) {
        // Call the assertion callback
        done(dataTypeSaveErr);
      });
  });

  it('should not be able to update an dataType if signed in without the "admin" role', function (done) {
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
          .post('/api/dataTypes')
          .send(dataType)
          .expect(403)
          .end(function (dataTypeSaveErr, dataTypeSaveRes) {
            // Call the assertion callback
            done(dataTypeSaveErr);
          });
      });
  });

  it('should be able to get a list of dataTypes if not signed in', function (done) {
    // Create new dataType model instance
    var dataTypeObj = new DataType(dataType);

    // Save the dataType
    dataTypeObj.save(function () {
      // Request dataTypes
      agent.get('/api/dataTypes').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single dataType if not signed in', function (done) {
    // Create new dataType model instance
    var dataTypeObj = new DataType(dataType);

    // Save the dataType
    dataTypeObj.save(function () {
      agent.get('/api/dataTypes/' + dataTypeObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', dataType.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single dataType with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/dataTypes/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'DataType is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single dataType which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent dataType
    agent.get('/api/dataTypes/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No dataType with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an dataType if signed in without the "admin" role', function (done) {
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
          .post('/api/dataTypes')
          .send(dataType)
          .expect(403)
          .end(function (dataTypeSaveErr, dataTypeSaveRes) {
            // Call the assertion callback
            done(dataTypeSaveErr);
          });
      });
  });

  it('should not be able to delete an dataType if not signed in', function (done) {
    // Set dataType user
    dataType.user = user;

    // Create new dataType model instance
    var dataTypeObj = new DataType(dataType);

    // Save the dataType
    dataTypeObj.save(function () {
      // Try deleting dataType
      agent
        .delete('/api/dataTypes/' + dataTypeObj._id)
        .expect(403)
        .end(function (dataTypeDeleteErr, dataTypeDeleteRes) {
          // Set message assertion
          dataTypeDeleteRes.body.message.should.match('User is not authorized');

          // Handle dataType error error
          done(dataTypeDeleteErr);
        });
    });
  });

  it('should be able to get a single dataType that has an orphaned user reference', function (done) {
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

              // Set assertions on new dataType
              dataTypeSaveRes.body.title.should.equal(dataType.title);
              should.exist(dataTypeSaveRes.body.user);
              should.equal(dataTypeSaveRes.body.user._id, orphanId);

              // force the dataType to have an orphaned user reference
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
                        should.equal(dataTypeInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single dataType if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new dataType model instance
    var dataTypeObj = new DataType(dataType);

    // Save the dataType
    dataTypeObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/dataTypes/' + dataTypeObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', dataType.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single dataType, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'dataTypeowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the DataType
    var _dataTypeOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _dataTypeOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the DataType
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

              // Set assertions on new dataType
              dataTypeSaveRes.body.title.should.equal(dataType.title);
              should.exist(dataTypeSaveRes.body.user);
              should.equal(dataTypeSaveRes.body.user._id, userId);

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
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      dataTypeInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    DataType.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
