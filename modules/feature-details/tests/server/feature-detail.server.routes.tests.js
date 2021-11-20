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
describe('FeatureDetail CRUD tests', function () {
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

  it('should not be able to save an featureDetail if logged in without the "admin" role', function (done) {
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
          .post('/api/featureDetails')
          .send(featureDetail)
          .expect(403)
          .end(function (featureDetailSaveErr, featureDetailSaveRes) {
            // Call the assertion callback
            done(featureDetailSaveErr);
          });
      });
  });

  it('should not be able to save an featureDetail if not logged in', function (done) {
    agent
      .post('/api/featureDetails')
      .send(featureDetail)
      .expect(403)
      .end(function (featureDetailSaveErr, featureDetailSaveRes) {
        // Call the assertion callback
        done(featureDetailSaveErr);
      });
  });

  it('should not be able to update an featureDetail if signed in without the "admin" role', function (done) {
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
          .post('/api/featureDetails')
          .send(featureDetail)
          .expect(403)
          .end(function (featureDetailSaveErr, featureDetailSaveRes) {
            // Call the assertion callback
            done(featureDetailSaveErr);
          });
      });
  });

  it('should be able to get a list of featureDetails if not signed in', function (done) {
    // Create new featureDetail model instance
    var featureDetailObj = new FeatureDetail(featureDetail);

    // Save the featureDetail
    featureDetailObj.save(function () {
      // Request featureDetails
      agent.get('/api/featureDetails').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single featureDetail if not signed in', function (done) {
    // Create new featureDetail model instance
    var featureDetailObj = new FeatureDetail(featureDetail);

    // Save the featureDetail
    featureDetailObj.save(function () {
      agent.get('/api/featureDetails/' + featureDetailObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', featureDetail.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single featureDetail with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/featureDetails/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'FeatureDetail is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single featureDetail which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent featureDetail
    agent.get('/api/featureDetails/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No featureDetail with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an featureDetail if signed in without the "admin" role', function (done) {
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
          .post('/api/featureDetails')
          .send(featureDetail)
          .expect(403)
          .end(function (featureDetailSaveErr, featureDetailSaveRes) {
            // Call the assertion callback
            done(featureDetailSaveErr);
          });
      });
  });

  it('should not be able to delete an featureDetail if not signed in', function (done) {
    // Set featureDetail user
    featureDetail.user = user;

    // Create new featureDetail model instance
    var featureDetailObj = new FeatureDetail(featureDetail);

    // Save the featureDetail
    featureDetailObj.save(function () {
      // Try deleting featureDetail
      agent
        .delete('/api/featureDetails/' + featureDetailObj._id)
        .expect(403)
        .end(function (featureDetailDeleteErr, featureDetailDeleteRes) {
          // Set message assertion
          featureDetailDeleteRes.body.message.should.match('User is not authorized');

          // Handle featureDetail error error
          done(featureDetailDeleteErr);
        });
    });
  });

  it('should be able to get a single featureDetail that has an orphaned user reference', function (done) {
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

              // Set assertions on new featureDetail
              featureDetailSaveRes.body.title.should.equal(featureDetail.title);
              should.exist(featureDetailSaveRes.body.user);
              should.equal(featureDetailSaveRes.body.user._id, orphanId);

              // force the featureDetail to have an orphaned user reference
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
                        should.equal(featureDetailInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single featureDetail if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new featureDetail model instance
    var featureDetailObj = new FeatureDetail(featureDetail);

    // Save the featureDetail
    featureDetailObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/featureDetails/' + featureDetailObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', featureDetail.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single featureDetail, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'featureDetailowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the FeatureDetail
    var _featureDetailOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _featureDetailOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the FeatureDetail
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

              // Set assertions on new featureDetail
              featureDetailSaveRes.body.title.should.equal(featureDetail.title);
              should.exist(featureDetailSaveRes.body.user);
              should.equal(featureDetailSaveRes.body.user._id, userId);

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
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      featureDetailInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    FeatureDetail.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
