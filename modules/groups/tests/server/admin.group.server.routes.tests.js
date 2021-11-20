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
describe('Group Admin CRUD tests', function () {
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

  it('should be able to save an group if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new group
        agent.post('/api/groups')
          .send(group)
          .expect(200)
          .end(function (groupSaveErr, groupSaveRes) {
            // Handle group save error
            if (groupSaveErr) {
              return done(groupSaveErr);
            }

            // Get a list of groups
            agent.get('/api/groups')
              .end(function (groupsGetErr, groupsGetRes) {
                // Handle group save error
                if (groupsGetErr) {
                  return done(groupsGetErr);
                }

                // Get groups list
                var groups = groupsGetRes.body;

                // Set assertions
                (groups[0].user._id).should.equal(userId);
                (groups[0].title).should.match('Group Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to update an group if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new group
        agent.post('/api/groups')
          .send(group)
          .expect(200)
          .end(function (groupSaveErr, groupSaveRes) {
            // Handle group save error
            if (groupSaveErr) {
              return done(groupSaveErr);
            }

            // Update group title
            group.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing group
            agent.put('/api/groups/' + groupSaveRes.body._id)
              .send(group)
              .expect(200)
              .end(function (groupUpdateErr, groupUpdateRes) {
                // Handle group update error
                if (groupUpdateErr) {
                  return done(groupUpdateErr);
                }

                // Set assertions
                (groupUpdateRes.body._id).should.equal(groupSaveRes.body._id);
                (groupUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an group if no title is provided', function (done) {
    // Invalidate title field
    group.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new group
        agent.post('/api/groups')
          .send(group)
          .expect(422)
          .end(function (groupSaveErr, groupSaveRes) {
            // Set message assertion
            (groupSaveRes.body.message).should.match('Title cannot be blank');

            // Handle group save error
            done(groupSaveErr);
          });
      });
  });

  it('should be able to delete an group if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new group
        agent.post('/api/groups')
          .send(group)
          .expect(200)
          .end(function (groupSaveErr, groupSaveRes) {
            // Handle group save error
            if (groupSaveErr) {
              return done(groupSaveErr);
            }

            // Delete an existing group
            agent.delete('/api/groups/' + groupSaveRes.body._id)
              .send(group)
              .expect(200)
              .end(function (groupDeleteErr, groupDeleteRes) {
                // Handle group error error
                if (groupDeleteErr) {
                  return done(groupDeleteErr);
                }

                // Set assertions
                (groupDeleteRes.body._id).should.equal(groupSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single group if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new group model instance
    group.user = user;
    var groupObj = new Group(group);

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new group
        agent.post('/api/groups')
          .send(group)
          .expect(200)
          .end(function (groupSaveErr, groupSaveRes) {
            // Handle group save error
            if (groupSaveErr) {
              return done(groupSaveErr);
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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                (groupInfoRes.body.isCurrentUserOwner).should.equal(true);

                // Call the assertion callback
                done();
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
