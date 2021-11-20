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
describe('Craft CRUD tests', function () {
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

  it('should not be able to save an craft if logged in without the "admin" role', function (done) {
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
          .post('/api/crafts')
          .send(craft)
          .expect(403)
          .end(function (craftSaveErr, craftSaveRes) {
            // Call the assertion callback
            done(craftSaveErr);
          });
      });
  });

  it('should not be able to save an craft if not logged in', function (done) {
    agent
      .post('/api/crafts')
      .send(craft)
      .expect(403)
      .end(function (craftSaveErr, craftSaveRes) {
        // Call the assertion callback
        done(craftSaveErr);
      });
  });

  it('should not be able to update an craft if signed in without the "admin" role', function (done) {
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
          .post('/api/crafts')
          .send(craft)
          .expect(403)
          .end(function (craftSaveErr, craftSaveRes) {
            // Call the assertion callback
            done(craftSaveErr);
          });
      });
  });

  it('should be able to get a list of crafts if not signed in', function (done) {
    // Create new craft model instance
    var craftObj = new Craft(craft);

    // Save the craft
    craftObj.save(function () {
      // Request crafts
      agent.get('/api/crafts').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single craft if not signed in', function (done) {
    // Create new craft model instance
    var craftObj = new Craft(craft);

    // Save the craft
    craftObj.save(function () {
      agent.get('/api/crafts/' + craftObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', craft.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single craft with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/crafts/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Craft is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single craft which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent craft
    agent.get('/api/crafts/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No craft with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an craft if signed in without the "admin" role', function (done) {
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
          .post('/api/crafts')
          .send(craft)
          .expect(403)
          .end(function (craftSaveErr, craftSaveRes) {
            // Call the assertion callback
            done(craftSaveErr);
          });
      });
  });

  it('should not be able to delete an craft if not signed in', function (done) {
    // Set craft user
    craft.user = user;

    // Create new craft model instance
    var craftObj = new Craft(craft);

    // Save the craft
    craftObj.save(function () {
      // Try deleting craft
      agent
        .delete('/api/crafts/' + craftObj._id)
        .expect(403)
        .end(function (craftDeleteErr, craftDeleteRes) {
          // Set message assertion
          craftDeleteRes.body.message.should.match('User is not authorized');

          // Handle craft error error
          done(craftDeleteErr);
        });
    });
  });

  it('should be able to get a single craft that has an orphaned user reference', function (done) {
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

              // Set assertions on new craft
              craftSaveRes.body.title.should.equal(craft.title);
              should.exist(craftSaveRes.body.user);
              should.equal(craftSaveRes.body.user._id, orphanId);

              // force the craft to have an orphaned user reference
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
                        should.equal(craftInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single craft if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new craft model instance
    var craftObj = new Craft(craft);

    // Save the craft
    craftObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/crafts/' + craftObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', craft.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single craft, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'craftowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Craft
    var _craftOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _craftOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Craft
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

              // Set assertions on new craft
              craftSaveRes.body.title.should.equal(craft.title);
              should.exist(craftSaveRes.body.user);
              should.equal(craftSaveRes.body.user._id, userId);

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
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      craftInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Craft.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
