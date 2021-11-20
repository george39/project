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
describe('Notification Admin CRUD tests', function () {
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

  it('should be able to save an notification if logged in', function (done) {
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

            // Get a list of notifications
            agent.get('/api/notifications').end(function (notificationsGetErr, notificationsGetRes) {
              // Handle notification save error
              if (notificationsGetErr) {
                return done(notificationsGetErr);
              }

              // Get notifications list
              var notifications = notificationsGetRes.body;

              // Set assertions
              notifications[0].user._id.should.equal(userId);
              notifications[0].title.should.match('Notification Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an notification if signed in', function (done) {
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

            // Update notification title
            notification.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing notification
            agent
              .put('/api/notifications/' + notificationSaveRes.body._id)
              .send(notification)
              .expect(200)
              .end(function (notificationUpdateErr, notificationUpdateRes) {
                // Handle notification update error
                if (notificationUpdateErr) {
                  return done(notificationUpdateErr);
                }

                // Set assertions
                notificationUpdateRes.body._id.should.equal(notificationSaveRes.body._id);
                notificationUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an notification if no title is provided', function (done) {
    // Invalidate title field
    notification.title = '';

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

        // Save a new notification
        agent
          .post('/api/notifications')
          .send(notification)
          .expect(422)
          .end(function (notificationSaveErr, notificationSaveRes) {
            // Set message assertion
            notificationSaveRes.body.message.should.match('Title cannot be blank');

            // Handle notification save error
            done(notificationSaveErr);
          });
      });
  });

  it('should be able to delete an notification if signed in', function (done) {
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

            // Delete an existing notification
            agent
              .delete('/api/notifications/' + notificationSaveRes.body._id)
              .send(notification)
              .expect(200)
              .end(function (notificationDeleteErr, notificationDeleteRes) {
                // Handle notification error error
                if (notificationDeleteErr) {
                  return done(notificationDeleteErr);
                }

                // Set assertions
                notificationDeleteRes.body._id.should.equal(notificationSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single notification if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new notification model instance
    notification.user = user;
    var notificationObj = new Notification(notification);

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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                notificationInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Notification.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
