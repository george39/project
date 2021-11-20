'use strict';

/**
 * Module dependencies
 */
var craftsPolicy = require('../policies/crafts.server.policy');
var crafts = require('../controllers/crafts.server.controller');

module.exports = function (app) {
  // Crafts collection routes
  app
    .route('/api/crafts')
    .all(craftsPolicy.isAllowed)
    .get(crafts.list)
    .post(crafts.create);

  // Single Craft routes
  app
    .route('/api/crafts/:craftId')
    .all(craftsPolicy.isAllowed)
    .get(crafts.read)
    .put(crafts.update)
    .delete(crafts.delete);

  // Finish by binding the Craft middleware
  app.param('craftId', crafts.craftByID);
};
