'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var DiscountList = mongoose.model('DiscountList');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var discountList;

/**
 * DiscountList routes tests
 */
describe('DiscountList CRUD tests', function () {
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

    // Save a user to the test db and create new discountList
    user
      .save()
      .then(function () {
        discountList = {
          title: 'DiscountList Title',
          content: 'DiscountList Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an discountList if logged in without the "admin" role', function (done) {
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
          .post('/api/discountLists')
          .send(discountList)
          .expect(403)
          .end(function (discountListSaveErr, discountListSaveRes) {
            // Call the assertion callback
            done(discountListSaveErr);
          });
      });
  });

  it('should not be able to save an discountList if not logged in', function (done) {
    agent
      .post('/api/discountLists')
      .send(discountList)
      .expect(403)
      .end(function (discountListSaveErr, discountListSaveRes) {
        // Call the assertion callback
        done(discountListSaveErr);
      });
  });

  it('should not be able to update an discountList if signed in without the "admin" role', function (done) {
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
          .post('/api/discountLists')
          .send(discountList)
          .expect(403)
          .end(function (discountListSaveErr, discountListSaveRes) {
            // Call the assertion callback
            done(discountListSaveErr);
          });
      });
  });

  it('should be able to get a list of discountLists if not signed in', function (done) {
    // Create new discountList model instance
    var discountListObj = new DiscountList(discountList);

    // Save the discountList
    discountListObj.save(function () {
      // Request discountLists
      agent.get('/api/discountLists').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single discountList if not signed in', function (done) {
    // Create new discountList model instance
    var discountListObj = new DiscountList(discountList);

    // Save the discountList
    discountListObj.save(function () {
      agent.get('/api/discountLists/' + discountListObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', discountList.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single discountList with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/discountLists/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'DiscountList is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single discountList which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent discountList
    agent.get('/api/discountLists/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No discountList with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an discountList if signed in without the "admin" role', function (done) {
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
          .post('/api/discountLists')
          .send(discountList)
          .expect(403)
          .end(function (discountListSaveErr, discountListSaveRes) {
            // Call the assertion callback
            done(discountListSaveErr);
          });
      });
  });

  it('should not be able to delete an discountList if not signed in', function (done) {
    // Set discountList user
    discountList.user = user;

    // Create new discountList model instance
    var discountListObj = new DiscountList(discountList);

    // Save the discountList
    discountListObj.save(function () {
      // Try deleting discountList
      agent
        .delete('/api/discountLists/' + discountListObj._id)
        .expect(403)
        .end(function (discountListDeleteErr, discountListDeleteRes) {
          // Set message assertion
          discountListDeleteRes.body.message.should.match('User is not authorized');

          // Handle discountList error error
          done(discountListDeleteErr);
        });
    });
  });

  it('should be able to get a single discountList that has an orphaned user reference', function (done) {
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

          // Save a new discountList
          agent
            .post('/api/discountLists')
            .send(discountList)
            .expect(200)
            .end(function (discountListSaveErr, discountListSaveRes) {
              // Handle discountList save error
              if (discountListSaveErr) {
                return done(discountListSaveErr);
              }

              // Set assertions on new discountList
              discountListSaveRes.body.title.should.equal(discountList.title);
              should.exist(discountListSaveRes.body.user);
              should.equal(discountListSaveRes.body.user._id, orphanId);

              // force the discountList to have an orphaned user reference
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

                    // Get the discountList
                    agent
                      .get('/api/discountLists/' + discountListSaveRes.body._id)
                      .expect(200)
                      .end(function (discountListInfoErr, discountListInfoRes) {
                        // Handle discountList error
                        if (discountListInfoErr) {
                          return done(discountListInfoErr);
                        }

                        // Set assertions
                        discountListInfoRes.body._id.should.equal(discountListSaveRes.body._id);
                        discountListInfoRes.body.title.should.equal(discountList.title);
                        should.equal(discountListInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single discountList if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new discountList model instance
    var discountListObj = new DiscountList(discountList);

    // Save the discountList
    discountListObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/discountLists/' + discountListObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', discountList.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single discountList, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'discountListowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the DiscountList
    var _discountListOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _discountListOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the DiscountList
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

          // Save a new discountList
          agent
            .post('/api/discountLists')
            .send(discountList)
            .expect(200)
            .end(function (discountListSaveErr, discountListSaveRes) {
              // Handle discountList save error
              if (discountListSaveErr) {
                return done(discountListSaveErr);
              }

              // Set assertions on new discountList
              discountListSaveRes.body.title.should.equal(discountList.title);
              should.exist(discountListSaveRes.body.user);
              should.equal(discountListSaveRes.body.user._id, userId);

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

                  // Get the discountList
                  agent
                    .get('/api/discountLists/' + discountListSaveRes.body._id)
                    .expect(200)
                    .end(function (discountListInfoErr, discountListInfoRes) {
                      // Handle discountList error
                      if (discountListInfoErr) {
                        return done(discountListInfoErr);
                      }

                      // Set assertions
                      discountListInfoRes.body._id.should.equal(discountListSaveRes.body._id);
                      discountListInfoRes.body.title.should.equal(discountList.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      discountListInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    DiscountList.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
