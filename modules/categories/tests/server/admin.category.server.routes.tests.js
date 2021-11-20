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
describe('Category Admin CRUD tests', function () {
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

  it('should be able to save an category if logged in', function (done) {
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

            // Get a list of categories
            agent.get('/api/categories').end(function (categoriesGetErr, categoriesGetRes) {
              // Handle category save error
              if (categoriesGetErr) {
                return done(categoriesGetErr);
              }

              // Get categories list
              var categories = categoriesGetRes.body;

              // Set assertions
              categories[0].user._id.should.equal(userId);
              categories[0].title.should.match('Category Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an category if signed in', function (done) {
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

            // Update category title
            category.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing category
            agent
              .put('/api/categories/' + categorySaveRes.body._id)
              .send(category)
              .expect(200)
              .end(function (categoryUpdateErr, categoryUpdateRes) {
                // Handle category update error
                if (categoryUpdateErr) {
                  return done(categoryUpdateErr);
                }

                // Set assertions
                categoryUpdateRes.body._id.should.equal(categorySaveRes.body._id);
                categoryUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an category if no title is provided', function (done) {
    // Invalidate title field
    category.title = '';

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

        // Save a new category
        agent
          .post('/api/categories')
          .send(category)
          .expect(422)
          .end(function (categorySaveErr, categorySaveRes) {
            // Set message assertion
            categorySaveRes.body.message.should.match('Title cannot be blank');

            // Handle category save error
            done(categorySaveErr);
          });
      });
  });

  it('should be able to delete an category if signed in', function (done) {
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

            // Delete an existing category
            agent
              .delete('/api/categories/' + categorySaveRes.body._id)
              .send(category)
              .expect(200)
              .end(function (categoryDeleteErr, categoryDeleteRes) {
                // Handle category error error
                if (categoryDeleteErr) {
                  return done(categoryDeleteErr);
                }

                // Set assertions
                categoryDeleteRes.body._id.should.equal(categorySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single category if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new category model instance
    category.user = user;
    var categoryObj = new Category(category);

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

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                categoryInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    Category.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
