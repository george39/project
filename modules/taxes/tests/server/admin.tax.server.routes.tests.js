'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Tax = mongoose.model('Tax');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var tax;

/**
 * Tax routes tests
 */
describe('Tax Admin CRUD tests', function () {
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

    // Save a user to the test db and create new tax
    user
      .save()
      .then(function () {
        tax = {
          title: 'Tax Title',
          content: 'Tax Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an tax if logged in', function (done) {
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

        // Save a new tax
        agent
          .post('/api/taxes')
          .send(tax)
          .expect(200)
          .end(function (taxSaveErr, taxSaveRes) {
            // Handle tax save error
            if (taxSaveErr) {
              return done(taxSaveErr);
            }

            // Get a list of taxes
            agent.get('/api/taxes').end(function (taxesGetErr, taxesGetRes) {
              // Handle tax save error
              if (taxesGetErr) {
                return done(taxesGetErr);
              }

              // Get taxes list
              var taxes = taxesGetRes.body;

              // Set assertions
              taxes[0].user._id.should.equal(userId);
              taxes[0].title.should.match('Tax Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an tax if signed in', function (done) {
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

        // Save a new tax
        agent
          .post('/api/taxes')
          .send(tax)
          .expect(200)
          .end(function (taxSaveErr, taxSaveRes) {
            // Handle tax save error
            if (taxSaveErr) {
              return done(taxSaveErr);
            }

            // Update tax title
            tax.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing tax
            agent
              .put('/api/taxes/' + taxSaveRes.body._id)
              .send(tax)
              .expect(200)
              .end(function (taxUpdateErr, taxUpdateRes) {
                // Handle tax update error
                if (taxUpdateErr) {
                  return done(taxUpdateErr);
                }

                // Set assertions
                taxUpdateRes.body._id.should.equal(taxSaveRes.body._id);
                taxUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an tax if no title is provided', function (done) {
    // Invalidate title field
    tax.title = '';

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

        // Save a new tax
        agent
          .post('/api/taxes')
          .send(tax)
          .expect(422)
          .end(function (taxSaveErr, taxSaveRes) {
            // Set message assertion
            taxSaveRes.body.message.should.match('Title cannot be blank');

            // Handle tax save error
            done(taxSaveErr);
          });
      });
  });

  it('should be able to delete an tax if signed in', function (done) {
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

        // Save a new tax
        agent
          .post('/api/taxes')
          .send(tax)
          .expect(200)
          .end(function (taxSaveErr, taxSaveRes) {
            // Handle tax save error
            if (taxSaveErr) {
              return done(taxSaveErr);
            }

            // Delete an existing tax
            agent
              .delete('/api/taxes/' + taxSaveRes.body._id)
              .send(tax)
              .expect(200)
              .end(function (taxDeleteErr, taxDeleteRes) {
                // Handle tax error error
                if (taxDeleteErr) {
                  return done(taxDeleteErr);
                }

                // Set assertions
                taxDeleteRes.body._id.should.equal(taxSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single tax if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new tax model instance
    tax.user = user;
    var taxObj = new Tax(tax);

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

        // Save a new tax
        agent
          .post('/api/taxes')
          .send(tax)
          .expect(200)
          .end(function (taxSaveErr, taxSaveRes) {
            // Handle tax save error
            if (taxSaveErr) {
              return done(taxSaveErr);
            }

            // Get the tax
            agent
              .get('/api/taxes/' + taxSaveRes.body._id)
              .expect(200)
              .end(function (taxInfoErr, taxInfoRes) {
                // Handle tax error
                if (taxInfoErr) {
                  return done(taxInfoErr);
                }

                // Set assertions
                taxInfoRes.body._id.should.equal(taxSaveRes.body._id);
                taxInfoRes.body.title.should.equal(tax.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                taxInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Tax.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
