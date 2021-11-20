'use strict';

var should = require('should');
var request = require('supertest');
var path = require('path');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var DiscountList = mongoose.model('DiscountList');
var express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app;
var agent;
var credentials;
var user;
var discountList;

/**
 * DiscountList routes tests
 */
describe('DiscountList Admin CRUD tests', function () {
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

    // Save a user to the test db and create new discountList
    user
      .save()
      .then(function () {
        discountList = {
          title: 'DiscountList Title',
          content: 'DiscountList Content'
        };

        done();
      })
      .catch(done);
  });

  it('should be able to save an discountList if logged in', function (done) {
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

        // Save a new discountList
        agent
          .post('/api/discountLists')
          .send(discountList)
          .expect(200)
          .end(function (discountListSaveErr, discountListSaveRes) {
            // Handle discountList save error
            if (discountListSaveErr) {
              return done(discountListSaveErr);
            }

            // Get a list of discountLists
            agent.get('/api/discountLists').end(function (discountListsGetErr, discountListsGetRes) {
              // Handle discountList save error
              if (discountListsGetErr) {
                return done(discountListsGetErr);
              }

              // Get discountLists list
              var discountLists = discountListsGetRes.body;

              // Set assertions
              discountLists[0].user._id.should.equal(userId);
              discountLists[0].title.should.match('DiscountList Title');

              // Call the assertion callback
              done();
            });
          });
      });
  });

  it('should be able to update an discountList if signed in', function (done) {
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

        // Save a new discountList
        agent
          .post('/api/discountLists')
          .send(discountList)
          .expect(200)
          .end(function (discountListSaveErr, discountListSaveRes) {
            // Handle discountList save error
            if (discountListSaveErr) {
              return done(discountListSaveErr);
            }

            // Update discountList title
            discountList.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing discountList
            agent
              .put('/api/discountLists/' + discountListSaveRes.body._id)
              .send(discountList)
              .expect(200)
              .end(function (discountListUpdateErr, discountListUpdateRes) {
                // Handle discountList update error
                if (discountListUpdateErr) {
                  return done(discountListUpdateErr);
                }

                // Set assertions
                discountListUpdateRes.body._id.should.equal(discountListSaveRes.body._id);
                discountListUpdateRes.body.title.should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an discountList if no title is provided', function (done) {
    // Invalidate title field
    discountList.title = '';

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

        // Save a new discountList
        agent
          .post('/api/discountLists')
          .send(discountList)
          .expect(422)
          .end(function (discountListSaveErr, discountListSaveRes) {
            // Set message assertion
            discountListSaveRes.body.message.should.match('Title cannot be blank');

            // Handle discountList save error
            done(discountListSaveErr);
          });
      });
  });

  it('should be able to delete an discountList if signed in', function (done) {
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

        // Save a new discountList
        agent
          .post('/api/discountLists')
          .send(discountList)
          .expect(200)
          .end(function (discountListSaveErr, discountListSaveRes) {
            // Handle discountList save error
            if (discountListSaveErr) {
              return done(discountListSaveErr);
            }

            // Delete an existing discountList
            agent
              .delete('/api/discountLists/' + discountListSaveRes.body._id)
              .send(discountList)
              .expect(200)
              .end(function (discountListDeleteErr, discountListDeleteRes) {
                // Handle discountList error error
                if (discountListDeleteErr) {
                  return done(discountListDeleteErr);
                }

                // Set assertions
                discountListDeleteRes.body._id.should.equal(discountListSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a single discountList if signed in and verify the custom "isCurrentUserOwner" field is set to "true"', function (done) {
    // Create new discountList model instance
    discountList.user = user;
    var discountListObj = new DiscountList(discountList);

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

        // Save a new discountList
        agent
          .post('/api/discountLists')
          .send(discountList)
          .expect(200)
          .end(function (discountListSaveErr, discountListSaveRes) {
            // Handle discountList save error
            if (discountListSaveErr) {
              return done(discountListSaveErr);
            }

            // Get the discountList
            agent
              .get('/api/discountLists/' + discountListSaveRes.body._id)
              .expect(200)
              .end(function (discountListInfoErr, discountListInfoRes) {
                // Handle discountList error
                if (discountListInfoErr) {
                  return done(discountListInfoErr);
                }

                // Set assertions
                discountListInfoRes.body._id.should.equal(discountListSaveRes.body._id);
                discountListInfoRes.body.title.should.equal(discountList.title);

                // Assert that the "isCurrentUserOwner" field is set to true since the current User created it
                discountListInfoRes.body.isCurrentUserOwner.should.equal(true);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  afterEach(function (done) {
    DiscountList.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
