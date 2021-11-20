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
describe('Tax CRUD tests', function () {
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

  it('should not be able to save an tax if logged in without the "admin" role', function (done) {
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
          .post('/api/taxes')
          .send(tax)
          .expect(403)
          .end(function (taxSaveErr, taxSaveRes) {
            // Call the assertion callback
            done(taxSaveErr);
          });
      });
  });

  it('should not be able to save an tax if not logged in', function (done) {
    agent
      .post('/api/taxes')
      .send(tax)
      .expect(403)
      .end(function (taxSaveErr, taxSaveRes) {
        // Call the assertion callback
        done(taxSaveErr);
      });
  });

  it('should not be able to update an tax if signed in without the "admin" role', function (done) {
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
          .post('/api/taxes')
          .send(tax)
          .expect(403)
          .end(function (taxSaveErr, taxSaveRes) {
            // Call the assertion callback
            done(taxSaveErr);
          });
      });
  });

  it('should be able to get a list of taxes if not signed in', function (done) {
    // Create new tax model instance
    var taxObj = new Tax(tax);

    // Save the tax
    taxObj.save(function () {
      // Request taxes
      agent.get('/api/taxes').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single tax if not signed in', function (done) {
    // Create new tax model instance
    var taxObj = new Tax(tax);

    // Save the tax
    taxObj.save(function () {
      agent.get('/api/taxes/' + taxObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', tax.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single tax with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/taxes/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Tax is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single tax which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent tax
    agent.get('/api/taxes/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No tax with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an tax if signed in without the "admin" role', function (done) {
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
          .post('/api/taxes')
          .send(tax)
          .expect(403)
          .end(function (taxSaveErr, taxSaveRes) {
            // Call the assertion callback
            done(taxSaveErr);
          });
      });
  });

  it('should not be able to delete an tax if not signed in', function (done) {
    // Set tax user
    tax.user = user;

    // Create new tax model instance
    var taxObj = new Tax(tax);

    // Save the tax
    taxObj.save(function () {
      // Try deleting tax
      agent
        .delete('/api/taxes/' + taxObj._id)
        .expect(403)
        .end(function (taxDeleteErr, taxDeleteRes) {
          // Set message assertion
          taxDeleteRes.body.message.should.match('User is not authorized');

          // Handle tax error error
          done(taxDeleteErr);
        });
    });
  });

  it('should be able to get a single tax that has an orphaned user reference', function (done) {
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

              // Set assertions on new tax
              taxSaveRes.body.title.should.equal(tax.title);
              should.exist(taxSaveRes.body.user);
              should.equal(taxSaveRes.body.user._id, orphanId);

              // force the tax to have an orphaned user reference
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
                        should.equal(taxInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single tax if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new tax model instance
    var taxObj = new Tax(tax);

    // Save the tax
    taxObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/taxes/' + taxObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', tax.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single tax, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'taxowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Tax
    var _taxOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _taxOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Tax
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

              // Set assertions on new tax
              taxSaveRes.body.title.should.equal(tax.title);
              should.exist(taxSaveRes.body.user);
              should.equal(taxSaveRes.body.user._id, userId);

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
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      taxInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Tax.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
