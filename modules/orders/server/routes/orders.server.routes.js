'use strict';

/**
 * Module dependencies
 */
var ordersPolicy = require('../policies/orders.server.policy');
var orders = require('../controllers/orders.server.controller');

module.exports = function (app) {
  // Orders collection routes
  app.route('/api/orders').all(ordersPolicy.isAllowed).get(orders.list).post(orders.create);

  // Orders findAll route
  app.route('/api/orders/findAll').all(ordersPolicy.isAllowed).get(orders.findAll);

  // Single Order routes
  app
    .route('/api/orders/:orderId')
    .all(ordersPolicy.isAllowed)
    .get(orders.read)
    .put(orders.update)
    .delete(orders.delete);

  // Finish by binding the Order middleware
  app.param('orderId', orders.orderByID);
};
