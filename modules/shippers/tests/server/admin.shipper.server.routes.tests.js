'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Shipper = mongoose.model('Shipper');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var shipper;

/**
 * Shipper routes tests
 */
describe('Shipper Admin CRUD tests', function () {
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

    // Save a user to the test db and create new shipper
    user
      .save()
      .then(function () {
        shipper = {
          title: 'Shipper Title',
          content: 'Shipper Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an shipper if logged in', function (done) {
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

        // Save a new shipper
        agent
          .post('/api/shippers')
          .send(shipper)
          .expect(200)
          .end(function (shipperSaveErr, shipperSaveRes) {
            // Handle shipper save error
            if (shipperSaveErr) {
              return done(shipperSaveErr);
            }

            // Get a list of shippers
            agent.get('/api/shippers').end(function (shippersGetErr, shippersGetRes) {
              // Handle shipper save error
              if (shippersGetErr) {
                return done(shippersGetErr);
              }

              // Get shippers list
              var shippers = shippersGetRes.body;

              // Set assertions
              shippers[0].user._id.should.equal(userId);
              shippers[0].title.should.match('Shipper Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an shipper if signed in', function (done) {
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

        // Save a new shipper
        agent
          .post('/api/shippers')
          .send(shipper)
          .expect(200)
          .end(function (shipperSaveErr, shipperSaveRes) {
            // Handle shipper save error
            if (shipperSaveErr) {
              return done(shipperSaveErr);
            }

            // Update shipper title
            shipper.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing shipper
            agent
              .put('/api/shippers/' + shipperSaveRes.body._id)
              .send(shipper)
              .expect(200)
              .end(function (shipperUpdateErr, shipperUpdateRes) {
                // Handle shipper update error
                if (shipperUpdateErr) {
                  return done(shipperUpdateErr);
                }

                // Set assertions
                shipperUpdateRes.body._id.should.equal(shipperSaveRes.body._id);
                shipperUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an shipper if no title is provided', function (done) {
    // Invalidate title field
    shipper.title = '';

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

        // Save a new shipper
        agent
          .post('/api/shippers')
          .send(shipper)
          .expect(422)
          .end(function (shipperSaveErr, shipperSaveRes) {
            // Set message assertion
            shipperSaveRes.body.message.should.match('Title cannot be blank');

            // Handle shipper save error
            done(shipperSaveErr);
          });
      });
  });

  it('should be able to delete an shipper if signed in', function (done) {
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

        // Save a new shipper
        agent
          .post('/api/shippers')
          .send(shipper)
          .expect(200)
          .end(function (shipperSaveErr, shipperSaveRes) {
            // Handle shipper save error
            if (shipperSaveErr) {
              return done(shipperSaveErr);
            }

            // Delete an existing shipper
            agent
              .delete('/api/shippers/' + shipperSaveRes.body._id)
              .send(shipper)
              .expect(200)
              .end(function (shipperDeleteErr, shipperDeleteRes) {
                // Handle shipper error error
                if (shipperDeleteErr) {
                  return done(shipperDeleteErr);
                }

                // Set assertions
                shipperDeleteRes.body._id.should.equal(shipperSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single shipper if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new shipper model instance
    shipper.user = user;
    var shipperObj = new Shipper(shipper);

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

        // Save a new shipper
        agent
          .post('/api/shippers')
          .send(shipper)
          .expect(200)
          .end(function (shipperSaveErr, shipperSaveRes) {
            // Handle shipper save error
            if (shipperSaveErr) {
              return done(shipperSaveErr);
            }

            // Get the shipper
            agent
              .get('/api/shippers/' + shipperSaveRes.body._id)
              .expect(200)
              .end(function (shipperInfoErr, shipperInfoRes) {
                // Handle shipper error
                if (shipperInfoErr) {
                  return done(shipperInfoErr);
                }

                // Set assertions
                shipperInfoRes.body._id.should.equal(shipperSaveRes.body._id);
                shipperInfoRes.body.title.should.equal(shipper.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                shipperInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Shipper.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
