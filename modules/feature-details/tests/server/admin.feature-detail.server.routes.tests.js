'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var FeatureDetail = mongoose.model('FeatureDetail');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var featureDetail;

/**
 * FeatureDetail routes tests
 */
describe('FeatureDetail Admin CRUD tests', function () {
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

    // Save a user to the test db and create new featureDetail
    user
      .save()
      .then(function () {
        featureDetail = {
          title: 'FeatureDetail Title',
          content: 'FeatureDetail Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an featureDetail if logged in', function (done) {
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

        // Save a new featureDetail
        agent
          .post('/api/featureDetails')
          .send(featureDetail)
          .expect(200)
          .end(function (featureDetailSaveErr, featureDetailSaveRes) {
            // Handle featureDetail save error
            if (featureDetailSaveErr) {
              return done(featureDetailSaveErr);
            }

            // Get a list of featureDetails
            agent.get('/api/featureDetails').end(function (featureDetailsGetErr, featureDetailsGetRes) {
              // Handle featureDetail save error
              if (featureDetailsGetErr) {
                return done(featureDetailsGetErr);
              }

              // Get featureDetails list
              var featureDetails = featureDetailsGetRes.body;

              // Set assertions
              featureDetails[0].user._id.should.equal(userId);
              featureDetails[0].title.should.match('FeatureDetail Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an featureDetail if signed in', function (done) {
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

        // Save a new featureDetail
        agent
          .post('/api/featureDetails')
          .send(featureDetail)
          .expect(200)
          .end(function (featureDetailSaveErr, featureDetailSaveRes) {
            // Handle featureDetail save error
            if (featureDetailSaveErr) {
              return done(featureDetailSaveErr);
            }

            // Update featureDetail title
            featureDetail.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing featureDetail
            agent
              .put('/api/featureDetails/' + featureDetailSaveRes.body._id)
              .send(featureDetail)
              .expect(200)
              .end(function (featureDetailUpdateErr, featureDetailUpdateRes) {
                // Handle featureDetail update error
                if (featureDetailUpdateErr) {
                  return done(featureDetailUpdateErr);
                }

                // Set assertions
                featureDetailUpdateRes.body._id.should.equal(featureDetailSaveRes.body._id);
                featureDetailUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an featureDetail if no title is provided', function (done) {
    // Invalidate title field
    featureDetail.title = '';

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

        // Save a new featureDetail
        agent
          .post('/api/featureDetails')
          .send(featureDetail)
          .expect(422)
          .end(function (featureDetailSaveErr, featureDetailSaveRes) {
            // Set message assertion
            featureDetailSaveRes.body.message.should.match('Title cannot be blank');

            // Handle featureDetail save error
            done(featureDetailSaveErr);
          });
      });
  });

  it('should be able to delete an featureDetail if signed in', function (done) {
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

        // Save a new featureDetail
        agent
          .post('/api/featureDetails')
          .send(featureDetail)
          .expect(200)
          .end(function (featureDetailSaveErr, featureDetailSaveRes) {
            // Handle featureDetail save error
            if (featureDetailSaveErr) {
              return done(featureDetailSaveErr);
            }

            // Delete an existing featureDetail
            agent
              .delete('/api/featureDetails/' + featureDetailSaveRes.body._id)
              .send(featureDetail)
              .expect(200)
              .end(function (featureDetailDeleteErr, featureDetailDeleteRes) {
                // Handle featureDetail error error
                if (featureDetailDeleteErr) {
                  return done(featureDetailDeleteErr);
                }

                // Set assertions
                featureDetailDeleteRes.body._id.should.equal(featureDetailSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single featureDetail if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new featureDetail model instance
    featureDetail.user = user;
    var featureDetailObj = new FeatureDetail(featureDetail);

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

        // Save a new featureDetail
        agent
          .post('/api/featureDetails')
          .send(featureDetail)
          .expect(200)
          .end(function (featureDetailSaveErr, featureDetailSaveRes) {
            // Handle featureDetail save error
            if (featureDetailSaveErr) {
              return done(featureDetailSaveErr);
            }

            // Get the featureDetail
            agent
              .get('/api/featureDetails/' + featureDetailSaveRes.body._id)
              .expect(200)
              .end(function (featureDetailInfoErr, featureDetailInfoRes) {
                // Handle featureDetail error
                if (featureDetailInfoErr) {
                  return done(featureDetailInfoErr);
                }

                // Set assertions
                featureDetailInfoRes.body._id.should.equal(featureDetailSaveRes.body._id);
                featureDetailInfoRes.body.title.should.equal(featureDetail.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                featureDetailInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    FeatureDetail.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
