'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Feature = mongoose.model('Feature');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var feature;

/**
 * Feature routes tests
 */
describe('Feature CRUD tests', function () {
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

    // Save a user to the test db and create new feature
    user
      .save()
      .then(function () {
        feature = {
          title: 'Feature Title',
          content: 'Feature Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an feature if logged in without the "admin" role', function (done) {
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
          .post('/api/features')
          .send(feature)
          .expect(403)
          .end(function (featureSaveErr, featureSaveRes) {
            // Call the assertion callback
            done(featureSaveErr);
          });
      });
  });

  it('should not be able to save an feature if not logged in', function (done) {
    agent
      .post('/api/features')
      .send(feature)
      .expect(403)
      .end(function (featureSaveErr, featureSaveRes) {
        // Call the assertion callback
        done(featureSaveErr);
      });
  });

  it('should not be able to update an feature if signed in without the "admin" role', function (done) {
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
          .post('/api/features')
          .send(feature)
          .expect(403)
          .end(function (featureSaveErr, featureSaveRes) {
            // Call the assertion callback
            done(featureSaveErr);
          });
      });
  });

  it('should be able to get a list of features if not signed in', function (done) {
    // Create new feature model instance
    var featureObj = new Feature(feature);

    // Save the feature
    featureObj.save(function () {
      // Request features
      agent.get('/api/features').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single feature if not signed in', function (done) {
    // Create new feature model instance
    var featureObj = new Feature(feature);

    // Save the feature
    featureObj.save(function () {
      agent.get('/api/features/' + featureObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', feature.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single feature with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/features/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Feature is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single feature which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent feature
    agent.get('/api/features/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No feature with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an feature if signed in without the "admin" role', function (done) {
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
          .post('/api/features')
          .send(feature)
          .expect(403)
          .end(function (featureSaveErr, featureSaveRes) {
            // Call the assertion callback
            done(featureSaveErr);
          });
      });
  });

  it('should not be able to delete an feature if not signed in', function (done) {
    // Set feature user
    feature.user = user;

    // Create new feature model instance
    var featureObj = new Feature(feature);

    // Save the feature
    featureObj.save(function () {
      // Try deleting feature
      agent
        .delete('/api/features/' + featureObj._id)
        .expect(403)
        .end(function (featureDeleteErr, featureDeleteRes) {
          // Set message assertion
          featureDeleteRes.body.message.should.match('User is not authorized');

          // Handle feature error error
          done(featureDeleteErr);
        });
    });
  });

  it('should be able to get a single feature that has an orphaned user reference', function (done) {
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

          // Save a new feature
          agent
            .post('/api/features')
            .send(feature)
            .expect(200)
            .end(function (featureSaveErr, featureSaveRes) {
              // Handle feature save error
              if (featureSaveErr) {
                return done(featureSaveErr);
              }

              // Set assertions on new feature
              featureSaveRes.body.title.should.equal(feature.title);
              should.exist(featureSaveRes.body.user);
              should.equal(featureSaveRes.body.user._id, orphanId);

              // force the feature to have an orphaned user reference
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

                    // Get the feature
                    agent
                      .get('/api/features/' + featureSaveRes.body._id)
                      .expect(200)
                      .end(function (featureInfoErr, featureInfoRes) {
                        // Handle feature error
                        if (featureInfoErr) {
                          return done(featureInfoErr);
                        }

                        // Set assertions
                        featureInfoRes.body._id.should.equal(featureSaveRes.body._id);
                        featureInfoRes.body.title.should.equal(feature.title);
                        should.equal(featureInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single feature if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new feature model instance
    var featureObj = new Feature(feature);

    // Save the feature
    featureObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/features/' + featureObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', feature.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single feature, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'featureowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Feature
    var _featureOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _featureOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Feature
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

          // Save a new feature
          agent
            .post('/api/features')
            .send(feature)
            .expect(200)
            .end(function (featureSaveErr, featureSaveRes) {
              // Handle feature save error
              if (featureSaveErr) {
                return done(featureSaveErr);
              }

              // Set assertions on new feature
              featureSaveRes.body.title.should.equal(feature.title);
              should.exist(featureSaveRes.body.user);
              should.equal(featureSaveRes.body.user._id, userId);

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

                  // Get the feature
                  agent
                    .get('/api/features/' + featureSaveRes.body._id)
                    .expect(200)
                    .end(function (featureInfoErr, featureInfoRes) {
                      // Handle feature error
                      if (featureInfoErr) {
                        return done(featureInfoErr);
                      }

                      // Set assertions
                      featureInfoRes.body._id.should.equal(featureSaveRes.body._id);
                      featureInfoRes.body.title.should.equal(feature.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      featureInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Feature.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
