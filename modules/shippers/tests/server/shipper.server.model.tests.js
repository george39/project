'use strict';

/**
 * Module dependencies.
 */
var should = require('should');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Shipper = mongoose.model('Shipper');

/**
 * Globals
 */
var user;
var shipper;

/**
 * Unit tests
 */
describe('Shipper Model Unit Tests:', function () {
  beforeEach(function (done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3',
      provider: 'local'
    });

    user
      .save()
      .then(function () {
        shipper = new Shipper({
          title: 'Shipper Title',
          content: 'Shipper Content',
          user: user
        });

        done();
      })
      .catch(done);
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      shipper.save(function (err) {
        should.not.exist(err);
        return done();
      });
    });

    it('should be able to show an error when try to save without title', function (done) {
      shipper.title = '';

      shipper.save(function (err) {
        should.exist(err);
        return done();
      });
    });
  });

  afterEach(function (done) {
    Shipper.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
