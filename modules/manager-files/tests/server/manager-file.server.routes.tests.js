'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var ManagerFile = mongoose.model('ManagerFile');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var managerFile;

/**
 * ManagerFile routes tests
 */
describe('ManagerFile CRUD tests', function () {
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

    // Save a user to the test db and create new managerFile
    user
      .save()
      .then(function () {
        managerFile = {
          title: 'ManagerFile Title',
          content: 'ManagerFile Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an managerFile if logged in without the "admin" role', function (done) {
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
          .post('/api/managerFiles')
          .send(managerFile)
          .expect(403)
          .end(function (managerFileSaveErr, managerFileSaveRes) {
            // Call the assertion callback
            done(managerFileSaveErr);
          });
      });
  });

  it('should not be able to save an managerFile if not logged in', function (done) {
    agent
      .post('/api/managerFiles')
      .send(managerFile)
      .expect(403)
      .end(function (managerFileSaveErr, managerFileSaveRes) {
        // Call the assertion callback
        done(managerFileSaveErr);
      });
  });

  it('should not be able to update an managerFile if signed in without the "admin" role', function (done) {
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
          .post('/api/managerFiles')
          .send(managerFile)
          .expect(403)
          .end(function (managerFileSaveErr, managerFileSaveRes) {
            // Call the assertion callback
            done(managerFileSaveErr);
          });
      });
  });

  it('should be able to get a list of managerFiles if not signed in', function (done) {
    // Create new managerFile model instance
    var managerFileObj = new ManagerFile(managerFile);

    // Save the managerFile
    managerFileObj.save(function () {
      // Request managerFiles
      agent.get('/api/managerFiles').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single managerFile if not signed in', function (done) {
    // Create new managerFile model instance
    var managerFileObj = new ManagerFile(managerFile);

    // Save the managerFile
    managerFileObj.save(function () {
      agent.get('/api/managerFiles/' + managerFileObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', managerFile.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single managerFile with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/managerFiles/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'ManagerFile is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single managerFile which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent managerFile
    agent.get('/api/managerFiles/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No managerFile with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an managerFile if signed in without the "admin" role', function (done) {
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
          .post('/api/managerFiles')
          .send(managerFile)
          .expect(403)
          .end(function (managerFileSaveErr, managerFileSaveRes) {
            // Call the assertion callback
            done(managerFileSaveErr);
          });
      });
  });

  it('should not be able to delete an managerFile if not signed in', function (done) {
    // Set managerFile user
    managerFile.user = user;

    // Create new managerFile model instance
    var managerFileObj = new ManagerFile(managerFile);

    // Save the managerFile
    managerFileObj.save(function () {
      // Try deleting managerFile
      agent
        .delete('/api/managerFiles/' + managerFileObj._id)
        .expect(403)
        .end(function (managerFileDeleteErr, managerFileDeleteRes) {
          // Set message assertion
          managerFileDeleteRes.body.message.should.match('User is not authorized');

          // Handle managerFile error error
          done(managerFileDeleteErr);
        });
    });
  });

  it('should be able to get a single managerFile that has an orphaned user reference', function (done) {
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

          // Save a new managerFile
          agent
            .post('/api/managerFiles')
            .send(managerFile)
            .expect(200)
            .end(function (managerFileSaveErr, managerFileSaveRes) {
              // Handle managerFile save error
              if (managerFileSaveErr) {
                return done(managerFileSaveErr);
              }

              // Set assertions on new managerFile
              managerFileSaveRes.body.title.should.equal(managerFile.title);
              should.exist(managerFileSaveRes.body.user);
              should.equal(managerFileSaveRes.body.user._id, orphanId);

              // force the managerFile to have an orphaned user reference
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

                    // Get the managerFile
                    agent
                      .get('/api/managerFiles/' + managerFileSaveRes.body._id)
                      .expect(200)
                      .end(function (managerFileInfoErr, managerFileInfoRes) {
                        // Handle managerFile error
                        if (managerFileInfoErr) {
                          return done(managerFileInfoErr);
                        }

                        // Set assertions
                        managerFileInfoRes.body._id.should.equal(managerFileSaveRes.body._id);
                        managerFileInfoRes.body.title.should.equal(managerFile.title);
                        should.equal(managerFileInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single managerFile if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new managerFile model instance
    var managerFileObj = new ManagerFile(managerFile);

    // Save the managerFile
    managerFileObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/managerFiles/' + managerFileObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', managerFile.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single managerFile, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'managerFileowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the ManagerFile
    var _managerFileOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _managerFileOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the ManagerFile
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

          // Save a new managerFile
          agent
            .post('/api/managerFiles')
            .send(managerFile)
            .expect(200)
            .end(function (managerFileSaveErr, managerFileSaveRes) {
              // Handle managerFile save error
              if (managerFileSaveErr) {
                return done(managerFileSaveErr);
              }

              // Set assertions on new managerFile
              managerFileSaveRes.body.title.should.equal(managerFile.title);
              should.exist(managerFileSaveRes.body.user);
              should.equal(managerFileSaveRes.body.user._id, userId);

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

                  // Get the managerFile
                  agent
                    .get('/api/managerFiles/' + managerFileSaveRes.body._id)
                    .expect(200)
                    .end(function (managerFileInfoErr, managerFileInfoRes) {
                      // Handle managerFile error
                      if (managerFileInfoErr) {
                        return done(managerFileInfoErr);
                      }

                      // Set assertions
                      managerFileInfoRes.body._id.should.equal(managerFileSaveRes.body._id);
                      managerFileInfoRes.body.title.should.equal(managerFile.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      managerFileInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    ManagerFile.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
