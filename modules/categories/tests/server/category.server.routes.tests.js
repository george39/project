'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Category = mongoose.model('Category');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var category;

/**
 * Category routes tests
 */
describe('Category CRUD tests', function () {
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

    // Save a user to the test db and create new category
    user
      .save()
      .then(function () {
        category = {
          title: 'Category Title',
          content: 'Category Content'
        };

        done();
      })
      .catch(done);
  });

  it('should not be able to save an category if logged in without the "admin" role', function (done) {
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
          .post('/api/categories')
          .send(category)
          .expect(403)
          .end(function (categorySaveErr, categorySaveRes) {
            // Call the assertion callback
            done(categorySaveErr);
          });
      });
  });

  it('should not be able to save an category if not logged in', function (done) {
    agent
      .post('/api/categories')
      .send(category)
      .expect(403)
      .end(function (categorySaveErr, categorySaveRes) {
        // Call the assertion callback
        done(categorySaveErr);
      });
  });

  it('should not be able to update an category if signed in without the "admin" role', function (done) {
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
          .post('/api/categories')
          .send(category)
          .expect(403)
          .end(function (categorySaveErr, categorySaveRes) {
            // Call the assertion callback
            done(categorySaveErr);
          });
      });
  });

  it('should be able to get a list of categories if not signed in', function (done) {
    // Create new category model instance
    var categoryObj = new Category(category);

    // Save the category
    categoryObj.save(function () {
      // Request categories
      agent.get('/api/categories').end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Array).and.have.lengthOf(1);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get a single category if not signed in', function (done) {
    // Create new category model instance
    var categoryObj = new Category(category);

    // Save the category
    categoryObj.save(function () {
      agent.get('/api/categories/' + categoryObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', category.title);

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return proper error for single category with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    agent.get('/api/categories/test').end(function (req, res) {
      // Set assertion
      res.body.should.be.instanceof(Object).and.have.property('message', 'Category is invalid');

      // Call the assertion callback
      done();
    });
  });

  it('should return proper error for single category which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent category
    agent.get('/api/categories/559e9cd815f80b4c256a8f41').end(function (req, res) {
      // Set assertion
      res.body.should.be
        .instanceof(Object)
        .and.have.property('message', 'No category with that identifier has been found');

      // Call the assertion callback
      done();
    });
  });

  it('should not be able to delete an category if signed in without the "admin" role', function (done) {
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
          .post('/api/categories')
          .send(category)
          .expect(403)
          .end(function (categorySaveErr, categorySaveRes) {
            // Call the assertion callback
            done(categorySaveErr);
          });
      });
  });

  it('should not be able to delete an category if not signed in', function (done) {
    // Set category user
    category.user = user;

    // Create new category model instance
    var categoryObj = new Category(category);

    // Save the category
    categoryObj.save(function () {
      // Try deleting category
      agent
        .delete('/api/categories/' + categoryObj._id)
        .expect(403)
        .end(function (categoryDeleteErr, categoryDeleteRes) {
          // Set message assertion
          categoryDeleteRes.body.message.should.match('User is not authorized');

          // Handle category error error
          done(categoryDeleteErr);
        });
    });
  });

  it('should be able to get a single category that has an orphaned user reference', function (done) {
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

          // Save a new category
          agent
            .post('/api/categories')
            .send(category)
            .expect(200)
            .end(function (categorySaveErr, categorySaveRes) {
              // Handle category save error
              if (categorySaveErr) {
                return done(categorySaveErr);
              }

              // Set assertions on new category
              categorySaveRes.body.title.should.equal(category.title);
              should.exist(categorySaveRes.body.user);
              should.equal(categorySaveRes.body.user._id, orphanId);

              // force the category to have an orphaned user reference
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

                    // Get the category
                    agent
                      .get('/api/categories/' + categorySaveRes.body._id)
                      .expect(200)
                      .end(function (categoryInfoErr, categoryInfoRes) {
                        // Handle category error
                        if (categoryInfoErr) {
                          return done(categoryInfoErr);
                        }

                        // Set assertions
                        categoryInfoRes.body._id.should.equal(categorySaveRes.body._id);
                        categoryInfoRes.body.title.should.equal(category.title);
                        should.equal(categoryInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  it('should be able to get a single category if not signed in and verify the custom "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create new category model instance
    var categoryObj = new Category(category);

    // Save the category
    categoryObj.save(function (err) {
      if (err) {
        return done(err);
      }
      agent.get('/api/categories/' + categoryObj._id).end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('title', category.title);
        // Assert the custom field "isCurrentUserOwner" is set to false for the un-authenticated User
        res.body.should.be.instanceof(Object).and.have.property('isCurrentUserOwner', false);
        // Call the assertion callback
        done();
      });
    });
  });

  it('should be able to get single category, that a different user created, if logged in & verify the "isCurrentUserOwner" field is set to "false"', function (done) {
    // Create temporary user creds
    var _creds = {
      usernameOrEmail: 'categoryowner',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create user that will create the Category
    var _categoryOwner = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'temp@test.com',
      username: _creds.usernameOrEmail,
      password: _creds.password,
      provider: 'local',
      roles: ['admin', 'user']
    });

    _categoryOwner.save(function (err, _user) {
      // Handle save error
      if (err) {
        return done(err);
      }

      // Sign in with the user that will create the Category
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

          // Save a new category
          agent
            .post('/api/categories')
            .send(category)
            .expect(200)
            .end(function (categorySaveErr, categorySaveRes) {
              // Handle category save error
              if (categorySaveErr) {
                return done(categorySaveErr);
              }

              // Set assertions on new category
              categorySaveRes.body.title.should.equal(category.title);
              should.exist(categorySaveRes.body.user);
              should.equal(categorySaveRes.body.user._id, userId);

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

                  // Get the category
                  agent
                    .get('/api/categories/' + categorySaveRes.body._id)
                    .expect(200)
                    .end(function (categoryInfoErr, categoryInfoRes) {
                      // Handle category error
                      if (categoryInfoErr) {
                        return done(categoryInfoErr);
                      }

                      // Set assertions
                      categoryInfoRes.body._id.should.equal(categorySaveRes.body._id);
                      categoryInfoRes.body.title.should.equal(category.title);
                      // Assert that the custom field "isCurrentUserOwner" is set to false since the current User didn't create it
                      categoryInfoRes.body.isCurrentUserOwner.should.equal(false);

                      // Call the assertion callback
                      done();
                    });
                });
            });
        });
    });
  });

  afterEach(function (done) {
    Category.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
