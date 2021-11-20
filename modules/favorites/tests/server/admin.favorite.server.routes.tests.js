'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Favorite = mongoose.model('Favorite');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var favorite;

/**
 * Favorite routes tests
 */
describe('Favorite Admin CRUD tests', function () {
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

    // Save a user to the test db and create new favorite
    user
      .save()
      .then(function () {
        favorite = {
          title: 'Favorite Title',
          content: 'Favorite Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an favorite if logged in', function (done) {
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

        // Save a new favorite
        agent
          .post('/api/favorites')
          .send(favorite)
          .expect(200)
          .end(function (favoriteSaveErr, favoriteSaveRes) {
            // Handle favorite save error
            if (favoriteSaveErr) {
              return done(favoriteSaveErr);
            }

            // Get a list of favorites
            agent.get('/api/favorites').end(function (favoritesGetErr, favoritesGetRes) {
              // Handle favorite save error
              if (favoritesGetErr) {
                return done(favoritesGetErr);
              }

              // Get favorites list
              var favorites = favoritesGetRes.body;

              // Set assertions
              favorites[0].user._id.should.equal(userId);
              favorites[0].title.should.match('Favorite Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an favorite if signed in', function (done) {
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

        // Save a new favorite
        agent
          .post('/api/favorites')
          .send(favorite)
          .expect(200)
          .end(function (favoriteSaveErr, favoriteSaveRes) {
            // Handle favorite save error
            if (favoriteSaveErr) {
              return done(favoriteSaveErr);
            }

            // Update favorite title
            favorite.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing favorite
            agent
              .put('/api/favorites/' + favoriteSaveRes.body._id)
              .send(favorite)
              .expect(200)
              .end(function (favoriteUpdateErr, favoriteUpdateRes) {
                // Handle favorite update error
                if (favoriteUpdateErr) {
                  return done(favoriteUpdateErr);
                }

                // Set assertions
                favoriteUpdateRes.body._id.should.equal(favoriteSaveRes.body._id);
                favoriteUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an favorite if no title is provided', function (done) {
    // Invalidate title field
    favorite.title = '';

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

        // Save a new favorite
        agent
          .post('/api/favorites')
          .send(favorite)
          .expect(422)
          .end(function (favoriteSaveErr, favoriteSaveRes) {
            // Set message assertion
            favoriteSaveRes.body.message.should.match('Title cannot be blank');

            // Handle favorite save error
            done(favoriteSaveErr);
          });
      });
  });

  it('should be able to delete an favorite if signed in', function (done) {
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

        // Save a new favorite
        agent
          .post('/api/favorites')
          .send(favorite)
          .expect(200)
          .end(function (favoriteSaveErr, favoriteSaveRes) {
            // Handle favorite save error
            if (favoriteSaveErr) {
              return done(favoriteSaveErr);
            }

            // Delete an existing favorite
            agent
              .delete('/api/favorites/' + favoriteSaveRes.body._id)
              .send(favorite)
              .expect(200)
              .end(function (favoriteDeleteErr, favoriteDeleteRes) {
                // Handle favorite error error
                if (favoriteDeleteErr) {
                  return done(favoriteDeleteErr);
                }

                // Set assertions
                favoriteDeleteRes.body._id.should.equal(favoriteSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single favorite if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new favorite model instance
    favorite.user = user;
    var favoriteObj = new Favorite(favorite);

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

        // Save a new favorite
        agent
          .post('/api/favorites')
          .send(favorite)
          .expect(200)
          .end(function (favoriteSaveErr, favoriteSaveRes) {
            // Handle favorite save error
            if (favoriteSaveErr) {
              return done(favoriteSaveErr);
            }

            // Get the favorite
            agent
              .get('/api/favorites/' + favoriteSaveRes.body._id)
              .expect(200)
              .end(function (favoriteInfoErr, favoriteInfoRes) {
                // Handle favorite error
                if (favoriteInfoErr) {
                  return done(favoriteInfoErr);
                }

                // Set assertions
                favoriteInfoRes.body._id.should.equal(favoriteSaveRes.body._id);
                favoriteInfoRes.body.title.should.equal(favorite.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                favoriteInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Favorite.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
