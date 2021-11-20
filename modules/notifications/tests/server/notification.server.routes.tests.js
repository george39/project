'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Notification = mongoose.model('Notification');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var notification;

/**
 * Notification routes tests
 */
describe('Notification CRUD tests', function () {
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

    // Save a user to the test db and create new notification
    user
      .save()
      .then(function () {
        notification = {
          title: 'Notification Title',
          content: 'Notification Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an notification if logged in without the "admin" role', function (done) {
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
          .post('/api/notifications')
          .send(notification)
          .expect(403)
          .end(function (notificationSaveErr, notificationSaveRes) {
            // Call the assertion callback
            done(notificationSaveErr);
          });
      });
  });

  it('should not be able to save an notification if not logged in', function (done) {
    agent
      .post('/api/notifications')
      .send(notification)
      .expect(403)
      .end(function (notificationSaveErr, notificationSaveRes) {
        // Call the assertion callback
        done(notificationSaveErr);
      });
  });

  it('should not be able to update an notification if signed in without the "admin" role', function (done) {
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
          .post('/api/notifications')
          .send(notification)
          .expect(403)
          .end(function (notificationSaveErr, notificationSaveRes) {
            // Call the assertion callback
            done(notificationSaveErr);
          });
      });
  });

  it('should be able to get a list of notifications if not signed in', function (done) {
    // Create new notification model instance
    var notificationObj = new Notification(notification);

    // Save the notification
    notificationObj.save(function () {
      // Request notifications
      agent.get('/api/notifications').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single notification if not signed in', function (done) {
    // Create new notification model instance
    var notificationObj = new Notification(notification);

    // Save the notification
    notificationObj.save(function () {
      agent.get('/api/notifications/' + notificationObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', notification.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single notification with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/notifications/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Notification is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single notification which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent notification
    agent.get('/api/notifications/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No notification with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an notification if signed in without the "admin" role', function (done) {
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
          .post('/api/notifications')
          .send(notification)
          .expect(403)
          .end(function (notificationSaveErr, notificationSaveRes) {
            // Call the assertion callback
            done(notificationSaveErr);
          });
      });
  });

  it('should not be able to delete an notification if not signed in', function (done) {
    // Set notification user
    notification.user = user;

    // Create new notification model instance
    var notificationObj = new Notification(notification);

    // Save the notification
    notificationObj.save(function () {
      // Try deleting notification
      agent
        .delete('/api/notifications/' + notificationObj._id)
        .expect(403)
        .end(function (notificationDeleteErr, notificationDeleteRes) {
          // Set message assertion
          notificationDeleteRes.body.message.should.match('User is not authorized');

          // Handle notification error error
          done(notificationDeleteErr);
        });
    });
  });

  it('should be able to get a single notification that has an orphaned user reference', function (done) {
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

          // Save a new notification
          agent
            .post('/api/notifications')
            .send(notification)
            .expect(200)
            .end(function (notificationSaveErr, notificationSaveRes) {
              // Handle notification save error
              if (notificationSaveErr) {
                return done(notificationSaveErr);
              }

              // Set assertions on new notification
              notificationSaveRes.body.title.should.equal(notification.title);
              should.exist(notificationSaveRes.body.user);
              should.equal(notificationSaveRes.body.user._id, orphanId);

              // force the notification to have an orphaned user reference
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

                    // Get the notification
                    agent
                      .get('/api/notifications/' + notificationSaveRes.body._id)
                      .expect(200)
                      .end(function (notificationInfoErr, notificationInfoRes) {
                        // Handle notification error
                        if (notificationInfoErr) {
                          return done(notificationInfoErr);
                        }

                        // Set assertions
                        notificationInfoRes.body._id.should.equal(notificationSaveRes.body._id);
                        notificationInfoRes.body.title.should.equal(notification.title);
                        should.equal(notificationInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single notification if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new notification model instance
    var notificationObj = new Notification(notification);

    // Save the notification
    notificationObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/notifications/' + notificationObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', notification.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single notification, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'notificationowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Notification
    var _notificationOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _notificationOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Notification
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

          // Save a new notification
          agent
            .post('/api/notifications')
            .send(notification)
            .expect(200)
            .end(function (notificationSaveErr, notificationSaveRes) {
              // Handle notification save error
              if (notificationSaveErr) {
                return done(notificationSaveErr);
              }

              // Set assertions on new notification
              notificationSaveRes.body.title.should.equal(notification.title);
              should.exist(notificationSaveRes.body.user);
              should.equal(notificationSaveRes.body.user._id, userId);

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

                  // Get the notification
                  agent
                    .get('/api/notifications/' + notificationSaveRes.body._id)
                    .expect(200)
                    .end(function (notificationInfoErr, notificationInfoRes) {
                      // Handle notification error
                      if (notificationInfoErr) {
                        return done(notificationInfoErr);
                      }

                      // Set assertions
                      notificationInfoRes.body._id.should.equal(notificationSaveRes.body._id);
                      notificationInfoRes.body.title.should.equal(notification.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      notificationInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Notification.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
