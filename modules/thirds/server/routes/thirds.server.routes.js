'use strict';

/**
 * Module dependencies
 */
var thirdsPolicy = require('../policies/thirds.server.policy');
var thirds = require('../controllers/thirds.server.controller');

module.exports = function (app) {
  // Thirds collection routes
  app.route('/api/thirds').all(thirdsPolicy.isAllowed).get(thirds.list).post(thirds.create);

  app.route('/api/thirds/findAll').all(thirdsPolicy.isAllowed).get(thirds.findAll);

  // Single Third routes
  app
    .route('/api/thirds/:thirdId')
    .all(thirdsPolicy.isAllowed)
    .get(thirds.read)
    .put(thirds.update)
    .delete(thirds.delete);

  // Finish by binding the Third middleware
  app.param('thirdId', thirds.thirdByID);
};
