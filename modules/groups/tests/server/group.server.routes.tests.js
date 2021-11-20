'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Group = mongoose.model('Group');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var group;

/**
 * Group routes tests
 */
describe('Group CRUD tests', function () {

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

    // Save a user to the test db and create new group
    user.save()
      .then(function () {
        group = {
          title: 'Group Title',
          content: 'Group Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an group if logged in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/groups')
          .send(group)
          .expect(403)
          .end(function (groupSaveErr, groupSaveRes) {
            // Call the assertion callback
            done(groupSaveErr);
          });

      });
  });

  it('should not be able to save an group if not logged in', function (done) {
    agent.post('/api/groups')
      .send(group)
      .expect(403)
      .end(function (groupSaveErr, groupSaveRes) {
        // Call the assertion callback
        done(groupSaveErr);
      });
  });

  it('should not be able to update an group if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/groups')
          .send(group)
          .expect(403)
          .end(function (groupSaveErr, groupSaveRes) {
            // Call the assertion callback
            done(groupSaveErr);
          });
      });
  });

  it('should be able to get a list of groups if not signed in', function (done) {
    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      // Request groups
      agent.get('/api/groups')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single group if not signed in', function (done) {
    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      agent.get('/api/groups/' + groupObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', group.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single group with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/groups/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Group is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single group which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent group
    agent.get('/api/groups/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No group with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should not be able to delete an group if signed in without the "admin" role', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        agent.post('/api/groups')
          .send(group)
          .expect(403)
          .end(function (groupSaveErr, groupSaveRes) {
            // Call the assertion callback
            done(groupSaveErr);
          });
      });
  });

  it('should not be able to delete an group if not signed in', function (done) {
    // Set group user
    group.user = user;

    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function () {
      // Try deleting group
      agent.delete('/api/groups/' + groupObj._id)
        .expect(403)
        .end(function (groupDeleteErr, groupDeleteRes) {
          // Set message assertion
          (groupDeleteRes.body.message).should.match('User is not authorized');

          // Handle group error error
          done(groupDeleteErr);
        });

    });
  });

  it('should be able to get a single group that has an orphaned user reference', function (done) {
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

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new group
          agent.post('/api/groups')
            .send(group)
            .expect(200)
            .end(function (groupSaveErr, groupSaveRes) {
              // Handle group save error
              if (groupSaveErr) {
                return done(groupSaveErr);
              }

              // Set assertions on new group
              (groupSaveRes.body.title).should.equal(group.title);
              should.exist(groupSaveRes.body.user);
              should.equal(groupSaveRes.body.user._id, orphanId);

              // force the group to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the group
                    agent.get('/api/groups/' + groupSaveRes.body._id)
                      .expect(200)
                      .end(function (groupInfoErr, groupInfoRes) {
                        // Handle group error
                        if (groupInfoErr) {
                          return done(groupInfoErr);
                        }

                        // Set assertions
                        (groupInfoRes.body._id).should.equal(groupSaveRes.body._id);
                        (groupInfoRes.body.title).should.equal(group.title);
                        should.equal(groupInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single group if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new group model instance
    var groupObj = new Group(group);

    // Save the group
    groupObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/groups/' + groupObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', group.title);
          // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
          res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
          // Call the assertion callback
          done();
        });
    });
  });

  it('should be able to get single group, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'groupowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Group
    var _groupOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _groupOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Group
      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var userId = _user._id;

          // Save a new group
          agent.post('/api/groups')
            .send(group)
            .expect(200)
            .end(function (groupSaveErr, groupSaveRes) {
              // Handle group save error
              if (groupSaveErr) {
                return done(groupSaveErr);
              }

              // Set assertions on new group
              (groupSaveRes.body.title).should.equal(group.title);
              should.exist(groupSaveRes.body.user);
              should.equal(groupSaveRes.body.user._id, userId);

              // now signin with the test suite user
              agent.post('/api/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (err, res) {
                  // Handle signin error
                  if (err) {
                    return done(err);
                  }

                  // Get the group
                  agent.get('/api/groups/' + groupSaveRes.body._id)
                    .expect(200)
                    .end(function (groupInfoErr, groupInfoRes) {
                      // Handle group error
                      if (groupInfoErr) {
                        return done(groupInfoErr);
                      }

                      // Set assertions
                      (groupInfoRes.body._id).should.equal(groupSaveRes.body._id);
                      (groupInfoRes.body.title).should.equal(group.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      (groupInfoRes.body.isCurrentUserOwner).should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Group.remove().exec()
      .then(User.remove().exec())
      .then(done())
      .catch(done);
  });
});
