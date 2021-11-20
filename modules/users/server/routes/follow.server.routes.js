'use strict';

const { isAllowed } = require('../policies/follow.server.policy');
const followController = require('../controllers/follow.server.controller');

module.exports = function (app) {
  // Setting up the users profile api
  app
    .route('/api/follow/:userId')
    .all(isAllowed)
    .get(followController.getOne)
    .post(followController.follow)
    .delete(followController.unfollow);
};

