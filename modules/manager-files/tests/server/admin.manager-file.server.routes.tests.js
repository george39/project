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
describe('ManagerFile Admin CRUD tests', function () {
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

  it('should be able to save an managerFile if logged in', function (done) {
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

            // Get a list of managerFiles
            agent.get('/api/managerFiles').end(function (managerFilesGetErr, managerFilesGetRes) {
              // Handle managerFile save error
              if (managerFilesGetErr) {
                return done(managerFilesGetErr);
              }

              // Get managerFiles list
              var managerFiles = managerFilesGetRes.body;

              // Set assertions
              managerFiles[0].user._id.should.equal(userId);
              managerFiles[0].title.should.match('ManagerFile Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an managerFile if signed in', function (done) {
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

            // Update managerFile title
            managerFile.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing managerFile
            agent
              .put('/api/managerFiles/' + managerFileSaveRes.body._id)
              .send(managerFile)
              .expect(200)
              .end(function (managerFileUpdateErr, managerFileUpdateRes) {
                // Handle managerFile update error
                if (managerFileUpdateErr) {
                  return done(managerFileUpdateErr);
                }

                // Set assertions
                managerFileUpdateRes.body._id.should.equal(managerFileSaveRes.body._id);
                managerFileUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an managerFile if no title is provided', function (done) {
    // Invalidate title field
    managerFile.title = '';

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

        // Save a new managerFile
        agent
          .post('/api/managerFiles')
          .send(managerFile)
          .expect(422)
          .end(function (managerFileSaveErr, managerFileSaveRes) {
            // Set message assertion
            managerFileSaveRes.body.message.should.match('Title cannot be blank');

            // Handle managerFile save error
            done(managerFileSaveErr);
          });
      });
  });

  it('should be able to delete an managerFile if signed in', function (done) {
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

            // Delete an existing managerFile
            agent
              .delete('/api/managerFiles/' + managerFileSaveRes.body._id)
              .send(managerFile)
              .expect(200)
              .end(function (managerFileDeleteErr, managerFileDeleteRes) {
                // Handle managerFile error error
                if (managerFileDeleteErr) {
                  return done(managerFileDeleteErr);
                }

                // Set assertions
                managerFileDeleteRes.body._id.should.equal(managerFileSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single managerFile if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new managerFile model instance
    managerFile.user = user;
    var managerFileObj = new ManagerFile(managerFile);

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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                managerFileInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    ManagerFile.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
