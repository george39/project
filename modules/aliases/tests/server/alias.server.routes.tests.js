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
describe('Alias CRUD tests', function () {
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

  it('should not be able to save an alias if logged in without the "admin" role', function (done) {
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
          .post('/api/aliases')
          .send(alias)
          .expect(403)
          .end(function (aliasSaveErr, aliasSaveRes) {
            // Call the assertion callback
            done(aliasSaveErr);
          });
      });
  });

  it('should not be able to save an alias if not logged in', function (done) {
    agent
      .post('/api/aliases')
      .send(alias)
      .expect(403)
      .end(function (aliasSaveErr, aliasSaveRes) {
        // Call the assertion callback
        done(aliasSaveErr);
      });
  });

  it('should not be able to update an alias if signed in without the "admin" role', function (done) {
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
          .post('/api/aliases')
          .send(alias)
          .expect(403)
          .end(function (aliasSaveErr, aliasSaveRes) {
            // Call the assertion callback
            done(aliasSaveErr);
          });
      });
  });

  it('should be able to get a list of aliases if not signed in', function (done) {
    // Create new alias model instance
    var aliasObj = new Alias(alias);

    // Save the alias
    aliasObj.save(function () {
      // Request aliases
      agent.get('/api/aliases').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single alias if not signed in', function (done) {
    // Create new alias model instance
    var aliasObj = new Alias(alias);

    // Save the alias
    aliasObj.save(function () {
      agent.get('/api/aliases/' + aliasObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', alias.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single alias with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/aliases/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Alias is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single alias which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent alias
    agent.get('/api/aliases/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No alias with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an alias if signed in without the "admin" role', function (done) {
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
          .post('/api/aliases')
          .send(alias)
          .expect(403)
          .end(function (aliasSaveErr, aliasSaveRes) {
            // Call the assertion callback
            done(aliasSaveErr);
          });
      });
  });

  it('should not be able to delete an alias if not signed in', function (done) {
    // Set alias user
    alias.user = user;

    // Create new alias model instance
    var aliasObj = new Alias(alias);

    // Save the alias
    aliasObj.save(function () {
      // Try deleting alias
      agent
        .delete('/api/aliases/' + aliasObj._id)
        .expect(403)
        .end(function (aliasDeleteErr, aliasDeleteRes) {
          // Set message assertion
          aliasDeleteRes.body.message.should.match('User is not authorized');

          // Handle alias error error
          done(aliasDeleteErr);
        });
    });
  });

  it('should be able to get a single alias that has an orphaned user reference', function (done) {
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

              // Set assertions on new alias
              aliasSaveRes.body.title.should.equal(alias.title);
              should.exist(aliasSaveRes.body.user);
              should.equal(aliasSaveRes.body.user._id, orphanId);

              // force the alias to have an orphaned user reference
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
                        should.equal(aliasInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single alias if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new alias model instance
    var aliasObj = new Alias(alias);

    // Save the alias
    aliasObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/aliases/' + aliasObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', alias.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single alias, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'aliasowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Alias
    var _aliasOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _aliasOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Alias
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

              // Set assertions on new alias
              aliasSaveRes.body.title.should.equal(alias.title);
              should.exist(aliasSaveRes.body.user);
              should.equal(aliasSaveRes.body.user._id, userId);

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
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      aliasInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Alias.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
