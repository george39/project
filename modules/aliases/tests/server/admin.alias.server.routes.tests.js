'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Alias = mongoose.model('Alias');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var alias;

/**
 * Alias routes tests
 */
describe('Alias Admin CRUD tests', function () {
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

    // Save a user to the test db and create new alias
    user
      .save()
      .then(function () {
        alias = {
          title: 'Alias Title',
          content: 'Alias Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an alias if logged in', function (done) {
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

        // Save a new alias
        agent
          .post('/api/aliases')
          .send(alias)
          .expect(200)
          .end(function (aliasSaveErr, aliasSaveRes) {
            // Handle alias save error
            if (aliasSaveErr) {
              return done(aliasSaveErr);
            }

            // Get a list of aliases
            agent.get('/api/aliases').end(function (aliasesGetErr, aliasesGetRes) {
              // Handle alias save error
              if (aliasesGetErr) {
                return done(aliasesGetErr);
              }

              // Get aliases list
              var aliases = aliasesGetRes.body;

              // Set assertions
              aliases[0].user._id.should.equal(userId);
              aliases[0].title.should.match('Alias Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an alias if signed in', function (done) {
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

        // Save a new alias
        agent
          .post('/api/aliases')
          .send(alias)
          .expect(200)
          .end(function (aliasSaveErr, aliasSaveRes) {
            // Handle alias save error
            if (aliasSaveErr) {
              return done(aliasSaveErr);
            }

            // Update alias title
            alias.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing alias
            agent
              .put('/api/aliases/' + aliasSaveRes.body._id)
              .send(alias)
              .expect(200)
              .end(function (aliasUpdateErr, aliasUpdateRes) {
                // Handle alias update error
                if (aliasUpdateErr) {
                  return done(aliasUpdateErr);
                }

                // Set assertions
                aliasUpdateRes.body._id.should.equal(aliasSaveRes.body._id);
                aliasUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an alias if no title is provided', function (done) {
    // Invalidate title field
    alias.title = '';

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

        // Save a new alias
        agent
          .post('/api/aliases')
          .send(alias)
          .expect(422)
          .end(function (aliasSaveErr, aliasSaveRes) {
            // Set message assertion
            aliasSaveRes.body.message.should.match('Title cannot be blank');

            // Handle alias save error
            done(aliasSaveErr);
          });
      });
  });

  it('should be able to delete an alias if signed in', function (done) {
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

        // Save a new alias
        agent
          .post('/api/aliases')
          .send(alias)
          .expect(200)
          .end(function (aliasSaveErr, aliasSaveRes) {
            // Handle alias save error
            if (aliasSaveErr) {
              return done(aliasSaveErr);
            }

            // Delete an existing alias
            agent
              .delete('/api/aliases/' + aliasSaveRes.body._id)
              .send(alias)
              .expect(200)
              .end(function (aliasDeleteErr, aliasDeleteRes) {
                // Handle alias error error
                if (aliasDeleteErr) {
                  return done(aliasDeleteErr);
                }

                // Set assertions
                aliasDeleteRes.body._id.should.equal(aliasSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single alias if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new alias model instance
    alias.user = user;
    var aliasObj = new Alias(alias);

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

        // Save a new alias
        agent
          .post('/api/aliases')
          .send(alias)
          .expect(200)
          .end(function (aliasSaveErr, aliasSaveRes) {
            // Handle alias save error
            if (aliasSaveErr) {
              return done(aliasSaveErr);
            }

            // Get the alias
            agent
              .get('/api/aliases/' + aliasSaveRes.body._id)
              .expect(200)
              .end(function (aliasInfoErr, aliasInfoRes) {
                // Handle alias error
                if (aliasInfoErr) {
                  return done(aliasInfoErr);
                }

                // Set assertions
                aliasInfoRes.body._id.should.equal(aliasSaveRes.body._id);
                aliasInfoRes.body.title.should.equal(alias.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                aliasInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Alias.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
