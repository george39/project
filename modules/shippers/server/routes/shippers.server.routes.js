'use strict';

/**
 * Module dependencies
 */
var shippersPolicy = require('../policies/shippers.server.policy');
var shippers = require('../controllers/shippers.server.controller');

module.exports = function (app) {
  // Shippers collection routes
  app.route('/api/shippers').all(shippersPolicy.isAllowed).get(shippers.list).post(shippers.create);

  // Shippers collection routes
  app.route('/api/shippers/findAll').all(shippersPolicy.isAllowed).get(shippers.findAll);

  // Single Shipper routes
  app
    .route('/api/shippers/:shipperId')
    .all(shippersPolicy.isAllowed)
    .get(shippers.read)
    .put(shippers.update)
    .delete(shippers.delete);

  // Finish by binding the Shipper middleware
  app.param('shipperId', shippers.shipperByID);
};
