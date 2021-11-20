'use strict';

/**
 * Module dependencies
 */
var craftsPolicy = require('../policies/crafts.server.policy');
var craftsUsers = require('../controllers/crafts-users.server.controller');

module.exports = function (app) {
  // Crafts collection routes
  app
    .route('/api/craftsUsers')
    .all(craftsPolicy.isAllowed)
    // .get(craftsUsers.list)
    .post(craftsUsers.create);

  app.route('/api/craftsUsers/purchase').post(craftsUsers.purchase);

  // Single Craft routes
  app
    .route('/api/craftsUsers/:craftId')
    .all(craftsPolicy.isAllowed)
    // .get(craftsUsers.read)
    // .put(craftsUsers.update)
    .delete(craftsUsers.delete);

  // Finish by binding the Craft middleware
  // app.param('craftId', craftsUsers.craftByID);
};
