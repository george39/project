'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Craft = mongoose.model('Craft');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var craft;

/**
 * Craft routes tests
 */
describe('Craft Admin CRUD tests', function () {
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

    // Save a user to the test db and create new craft
    user
      .save()
      .then(function () {
        craft = {
          title: 'Craft Title',
          content: 'Craft Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an craft if logged in', function (done) {
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

        // Save a new craft
        agent
          .post('/api/crafts')
          .send(craft)
          .expect(200)
          .end(function (craftSaveErr, craftSaveRes) {
            // Handle craft save error
            if (craftSaveErr) {
              return done(craftSaveErr);
            }

            // Get a list of crafts
            agent.get('/api/crafts').end(function (craftsGetErr, craftsGetRes) {
              // Handle craft save error
              if (craftsGetErr) {
                return done(craftsGetErr);
              }

              // Get crafts list
              var crafts = craftsGetRes.body;

              // Set assertions
              crafts[0].user._id.should.equal(userId);
              crafts[0].title.should.match('Craft Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an craft if signed in', function (done) {
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

        // Save a new craft
        agent
          .post('/api/crafts')
          .send(craft)
          .expect(200)
          .end(function (craftSaveErr, craftSaveRes) {
            // Handle craft save error
            if (craftSaveErr) {
              return done(craftSaveErr);
            }

            // Update craft title
            craft.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing craft
            agent
              .put('/api/crafts/' + craftSaveRes.body._id)
              .send(craft)
              .expect(200)
              .end(function (craftUpdateErr, craftUpdateRes) {
                // Handle craft update error
                if (craftUpdateErr) {
                  return done(craftUpdateErr);
                }

                // Set assertions
                craftUpdateRes.body._id.should.equal(craftSaveRes.body._id);
                craftUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an craft if no title is provided', function (done) {
    // Invalidate title field
    craft.title = '';

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

        // Save a new craft
        agent
          .post('/api/crafts')
          .send(craft)
          .expect(422)
          .end(function (craftSaveErr, craftSaveRes) {
            // Set message assertion
            craftSaveRes.body.message.should.match('Title cannot be blank');

            // Handle craft save error
            done(craftSaveErr);
          });
      });
  });

  it('should be able to delete an craft if signed in', function (done) {
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

        // Save a new craft
        agent
          .post('/api/crafts')
          .send(craft)
          .expect(200)
          .end(function (craftSaveErr, craftSaveRes) {
            // Handle craft save error
            if (craftSaveErr) {
              return done(craftSaveErr);
            }

            // Delete an existing craft
            agent
              .delete('/api/crafts/' + craftSaveRes.body._id)
              .send(craft)
              .expect(200)
              .end(function (craftDeleteErr, craftDeleteRes) {
                // Handle craft error error
                if (craftDeleteErr) {
                  return done(craftDeleteErr);
                }

                // Set assertions
                craftDeleteRes.body._id.should.equal(craftSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single craft if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new craft model instance
    craft.user = user;
    var craftObj = new Craft(craft);

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

        // Save a new craft
        agent
          .post('/api/crafts')
          .send(craft)
          .expect(200)
          .end(function (craftSaveErr, craftSaveRes) {
            // Handle craft save error
            if (craftSaveErr) {
              return done(craftSaveErr);
            }

            // Get the craft
            agent
              .get('/api/crafts/' + craftSaveRes.body._id)
              .expect(200)
              .end(function (craftInfoErr, craftInfoRes) {
                // Handle craft error
                if (craftInfoErr) {
                  return done(craftInfoErr);
                }

                // Set assertions
                craftInfoRes.body._id.should.equal(craftSaveRes.body._id);
                craftInfoRes.body.title.should.equal(craft.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                craftInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Craft.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
