'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Lang = mongoose.model('Lang');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var lang;

/**
 * Lang routes tests
 */
describe('Lang CRUD tests', function () {
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

    // Save a user to the test db and create new lang
    user
      .save()
      .then(function () {
        lang = {
          title: 'Lang Title',
          content: 'Lang Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an lang if logged in without the "admin" role', function (done) {
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
          .post('/api/langs')
          .send(lang)
          .expect(403)
          .end(function (langSaveErr, langSaveRes) {
            // Call the assertion callback
            done(langSaveErr);
          });
      });
  });

  it('should not be able to save an lang if not logged in', function (done) {
    agent
      .post('/api/langs')
      .send(lang)
      .expect(403)
      .end(function (langSaveErr, langSaveRes) {
        // Call the assertion callback
        done(langSaveErr);
      });
  });

  it('should not be able to update an lang if signed in without the "admin" role', function (done) {
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
          .post('/api/langs')
          .send(lang)
          .expect(403)
          .end(function (langSaveErr, langSaveRes) {
            // Call the assertion callback
            done(langSaveErr);
          });
      });
  });

  it('should be able to get a list of langs if not signed in', function (done) {
    // Create new lang model instance
    var langObj = new Lang(lang);

    // Save the lang
    langObj.save(function () {
      // Request langs
      agent.get('/api/langs').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single lang if not signed in', function (done) {
    // Create new lang model instance
    var langObj = new Lang(lang);

    // Save the lang
    langObj.save(function () {
      agent.get('/api/langs/' + langObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', lang.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single lang with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/langs/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Lang is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single lang which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent lang
    agent.get('/api/langs/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No lang with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an lang if signed in without the "admin" role', function (done) {
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
          .post('/api/langs')
          .send(lang)
          .expect(403)
          .end(function (langSaveErr, langSaveRes) {
            // Call the assertion callback
            done(langSaveErr);
          });
      });
  });

  it('should not be able to delete an lang if not signed in', function (done) {
    // Set lang user
    lang.user = user;

    // Create new lang model instance
    var langObj = new Lang(lang);

    // Save the lang
    langObj.save(function () {
      // Try deleting lang
      agent
        .delete('/api/langs/' + langObj._id)
        .expect(403)
        .end(function (langDeleteErr, langDeleteRes) {
          // Set message assertion
          langDeleteRes.body.message.should.match('User is not authorized');

          // Handle lang error error
          done(langDeleteErr);
        });
    });
  });

  it('should be able to get a single lang that has an orphaned user reference', function (done) {
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

          // Save a new lang
          agent
            .post('/api/langs')
            .send(lang)
            .expect(200)
            .end(function (langSaveErr, langSaveRes) {
              // Handle lang save error
              if (langSaveErr) {
                return done(langSaveErr);
              }

              // Set assertions on new lang
              langSaveRes.body.title.should.equal(lang.title);
              should.exist(langSaveRes.body.user);
              should.equal(langSaveRes.body.user._id, orphanId);

              // force the lang to have an orphaned user reference
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

                    // Get the lang
                    agent
                      .get('/api/langs/' + langSaveRes.body._id)
                      .expect(200)
                      .end(function (langInfoErr, langInfoRes) {
                        // Handle lang error
                        if (langInfoErr) {
                          return done(langInfoErr);
                        }

                        // Set assertions
                        langInfoRes.body._id.should.equal(langSaveRes.body._id);
                        langInfoRes.body.title.should.equal(lang.title);
                        should.equal(langInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single lang if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new lang model instance
    var langObj = new Lang(lang);

    // Save the lang
    langObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/langs/' + langObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', lang.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single lang, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'langowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Lang
    var _langOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _langOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Lang
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

          // Save a new lang
          agent
            .post('/api/langs')
            .send(lang)
            .expect(200)
            .end(function (langSaveErr, langSaveRes) {
              // Handle lang save error
              if (langSaveErr) {
                return done(langSaveErr);
              }

              // Set assertions on new lang
              langSaveRes.body.title.should.equal(lang.title);
              should.exist(langSaveRes.body.user);
              should.equal(langSaveRes.body.user._id, userId);

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

                  // Get the lang
                  agent
                    .get('/api/langs/' + langSaveRes.body._id)
                    .expect(200)
                    .end(function (langInfoErr, langInfoRes) {
                      // Handle lang error
                      if (langInfoErr) {
                        return done(langInfoErr);
                      }

                      // Set assertions
                      langInfoRes.body._id.should.equal(langSaveRes.body._id);
                      langInfoRes.body.title.should.equal(lang.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      langInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Lang.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
