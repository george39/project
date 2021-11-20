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
describe('Favorite CRUD tests', function () {
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

  it('should not be able to save an favorite if logged in without the "admin" role', function (done) {
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
          .post('/api/favorites')
          .send(favorite)
          .expect(403)
          .end(function (favoriteSaveErr, favoriteSaveRes) {
            // Call the assertion callback
            done(favoriteSaveErr);
          });
      });
  });

  it('should not be able to save an favorite if not logged in', function (done) {
    agent
      .post('/api/favorites')
      .send(favorite)
      .expect(403)
      .end(function (favoriteSaveErr, favoriteSaveRes) {
        // Call the assertion callback
        done(favoriteSaveErr);
      });
  });

  it('should not be able to update an favorite if signed in without the "admin" role', function (done) {
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
          .post('/api/favorites')
          .send(favorite)
          .expect(403)
          .end(function (favoriteSaveErr, favoriteSaveRes) {
            // Call the assertion callback
            done(favoriteSaveErr);
          });
      });
  });

  it('should be able to get a list of favorites if not signed in', function (done) {
    // Create new favorite model instance
    var favoriteObj = new Favorite(favorite);

    // Save the favorite
    favoriteObj.save(function () {
      // Request favorites
      agent.get('/api/favorites').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single favorite if not signed in', function (done) {
    // Create new favorite model instance
    var favoriteObj = new Favorite(favorite);

    // Save the favorite
    favoriteObj.save(function () {
      agent.get('/api/favorites/' + favoriteObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', favorite.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single favorite with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/favorites/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Favorite is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single favorite which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent favorite
    agent.get('/api/favorites/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No favorite with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an favorite if signed in without the "admin" role', function (done) {
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
          .post('/api/favorites')
          .send(favorite)
          .expect(403)
          .end(function (favoriteSaveErr, favoriteSaveRes) {
            // Call the assertion callback
            done(favoriteSaveErr);
          });
      });
  });

  it('should not be able to delete an favorite if not signed in', function (done) {
    // Set favorite user
    favorite.user = user;

    // Create new favorite model instance
    var favoriteObj = new Favorite(favorite);

    // Save the favorite
    favoriteObj.save(function () {
      // Try deleting favorite
      agent
        .delete('/api/favorites/' + favoriteObj._id)
        .expect(403)
        .end(function (favoriteDeleteErr, favoriteDeleteRes) {
          // Set message assertion
          favoriteDeleteRes.body.message.should.match('User is not authorized');

          // Handle favorite error error
          done(favoriteDeleteErr);
        });
    });
  });

  it('should be able to get a single favorite that has an orphaned user reference', function (done) {
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

              // Set assertions on new favorite
              favoriteSaveRes.body.title.should.equal(favorite.title);
              should.exist(favoriteSaveRes.body.user);
              should.equal(favoriteSaveRes.body.user._id, orphanId);

              // force the favorite to have an orphaned user reference
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
                        should.equal(favoriteInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single favorite if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new favorite model instance
    var favoriteObj = new Favorite(favorite);

    // Save the favorite
    favoriteObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/favorites/' + favoriteObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', favorite.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single favorite, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'favoriteowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Favorite
    var _favoriteOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _favoriteOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Favorite
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

              // Set assertions on new favorite
              favoriteSaveRes.body.title.should.equal(favorite.title);
              should.exist(favoriteSaveRes.body.user);
              should.equal(favoriteSaveRes.body.user._id, userId);

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
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      favoriteInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Favorite.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
