'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var DiscountMassive = mongoose.model('DiscountMassive');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var discountMassive;

/**
 * DiscountMassive routes tests
 */
describe('DiscountMassive Admin CRUD tests', function () {
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

    // Save a user to the test db and create new discountMassive
    user
      .save()
      .then(function () {
        discountMassive = {
          title: 'DiscountMassive Title',
          content: 'DiscountMassive Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an discountMassive if logged in', function (done) {
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

        // Save a new discountMassive
        agent
          .post('/api/discountMassives')
          .send(discountMassive)
          .expect(200)
          .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
            // Handle discountMassive save error
            if (discountMassiveSaveErr) {
              return done(discountMassiveSaveErr);
            }

            // Get a list of discountMassives
            agent.get('/api/discountMassives').end(function (discountMassivesGetErr, discountMassivesGetRes) {
              // Handle discountMassive save error
              if (discountMassivesGetErr) {
                return done(discountMassivesGetErr);
              }

              // Get discountMassives list
              var discountMassives = discountMassivesGetRes.body;

              // Set assertions
              discountMassives[0].user._id.should.equal(userId);
              discountMassives[0].title.should.match('DiscountMassive Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an discountMassive if signed in', function (done) {
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

        // Save a new discountMassive
        agent
          .post('/api/discountMassives')
          .send(discountMassive)
          .expect(200)
          .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
            // Handle discountMassive save error
            if (discountMassiveSaveErr) {
              return done(discountMassiveSaveErr);
            }

            // Update discountMassive title
            discountMassive.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing discountMassive
            agent
              .put('/api/discountMassives/' + discountMassiveSaveRes.body._id)
              .send(discountMassive)
              .expect(200)
              .end(function (discountMassiveUpdateErr, discountMassiveUpdateRes) {
                // Handle discountMassive update error
                if (discountMassiveUpdateErr) {
                  return done(discountMassiveUpdateErr);
                }

                // Set assertions
                discountMassiveUpdateRes.body._id.should.equal(discountMassiveSaveRes.body._id);
                discountMassiveUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an discountMassive if no title is provided', function (done) {
    // Invalidate title field
    discountMassive.title = '';

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

        // Save a new discountMassive
        agent
          .post('/api/discountMassives')
          .send(discountMassive)
          .expect(422)
          .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
            // Set message assertion
            discountMassiveSaveRes.body.message.should.match('Title cannot be blank');

            // Handle discountMassive save error
            done(discountMassiveSaveErr);
          });
      });
  });

  it('should be able to delete an discountMassive if signed in', function (done) {
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

        // Save a new discountMassive
        agent
          .post('/api/discountMassives')
          .send(discountMassive)
          .expect(200)
          .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
            // Handle discountMassive save error
            if (discountMassiveSaveErr) {
              return done(discountMassiveSaveErr);
            }

            // Delete an existing discountMassive
            agent
              .delete('/api/discountMassives/' + discountMassiveSaveRes.body._id)
              .send(discountMassive)
              .expect(200)
              .end(function (discountMassiveDeleteErr, discountMassiveDeleteRes) {
                // Handle discountMassive error error
                if (discountMassiveDeleteErr) {
                  return done(discountMassiveDeleteErr);
                }

                // Set assertions
                discountMassiveDeleteRes.body._id.should.equal(discountMassiveSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single discountMassive if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new discountMassive model instance
    discountMassive.user = user;
    var discountMassiveObj = new DiscountMassive(discountMassive);

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

        // Save a new discountMassive
        agent
          .post('/api/discountMassives')
          .send(discountMassive)
          .expect(200)
          .end(function (discountMassiveSaveErr, discountMassiveSaveRes) {
            // Handle discountMassive save error
            if (discountMassiveSaveErr) {
              return done(discountMassiveSaveErr);
            }

            // Get the discountMassive
            agent
              .get('/api/discountMassives/' + discountMassiveSaveRes.body._id)
              .expect(200)
              .end(function (discountMassiveInfoErr, discountMassiveInfoRes) {
                // Handle discountMassive error
                if (discountMassiveInfoErr) {
                  return done(discountMassiveInfoErr);
                }

                // Set assertions
                discountMassiveInfoRes.body._id.should.equal(discountMassiveSaveRes.body._id);
                discountMassiveInfoRes.body.title.should.equal(discountMassive.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                discountMassiveInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    DiscountMassive.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
