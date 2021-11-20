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
describe('Feature Admin CRUD tests', function () {
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

  it('should be able to save an feature if logged in', function (done) {
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

            // Get a list of features
            agent.get('/api/features').end(function (featuresGetErr, featuresGetRes) {
              // Handle feature save error
              if (featuresGetErr) {
                return done(featuresGetErr);
              }

              // Get features list
              var features = featuresGetRes.body;

              // Set assertions
              features[0].user._id.should.equal(userId);
              features[0].title.should.match('Feature Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an feature if signed in', function (done) {
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

            // Update feature title
            feature.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing feature
            agent
              .put('/api/features/' + featureSaveRes.body._id)
              .send(feature)
              .expect(200)
              .end(function (featureUpdateErr, featureUpdateRes) {
                // Handle feature update error
                if (featureUpdateErr) {
                  return done(featureUpdateErr);
                }

                // Set assertions
                featureUpdateRes.body._id.should.equal(featureSaveRes.body._id);
                featureUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an feature if no title is provided', function (done) {
    // Invalidate title field
    feature.title = '';

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

        // Save a new feature
        agent
          .post('/api/features')
          .send(feature)
          .expect(422)
          .end(function (featureSaveErr, featureSaveRes) {
            // Set message assertion
            featureSaveRes.body.message.should.match('Title cannot be blank');

            // Handle feature save error
            done(featureSaveErr);
          });
      });
  });

  it('should be able to delete an feature if signed in', function (done) {
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

            // Delete an existing feature
            agent
              .delete('/api/features/' + featureSaveRes.body._id)
              .send(feature)
              .expect(200)
              .end(function (featureDeleteErr, featureDeleteRes) {
                // Handle feature error error
                if (featureDeleteErr) {
                  return done(featureDeleteErr);
                }

                // Set assertions
                featureDeleteRes.body._id.should.equal(featureSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single feature if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new feature model instance
    feature.user = user;
    var featureObj = new Feature(feature);

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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                featureInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Feature.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
