'use strict';

/**
 * Module dependencies.
 */
var should = require('should');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var DiscountMassive = mongoose.model('DiscountMassive');

/**
 * Globals
 */
var user;
var discountMassive;

/**
 * Unit tests
 */
describe('DiscountMassive Model Unit Tests:', function () {
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
        discountMassive = new DiscountMassive({
          title: 'DiscountMassive Title',
          content: 'DiscountMassive Content',
          user: user
        });

        done();
      })
      .catch(done);
  });

  describe('Method Save', function () {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      discountMassive.save(function (err) {
        should.not.exist(err);
        return done();
      });
    });

    it('should be able to show an error when try to save without title', function (done) {
      discountMassive.title = '';

      discountMassive.save(function (err) {
        should.exist(err);
        return done();
      });
    });
  });

  afterEach(function (done) {
    DiscountMassive.remove().exec().then(User.remove().exec()).then(done()).catch(done);
  });
});
