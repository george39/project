'use strict';

/**
 * Module dependencies
 */
var historyOrdersPolicy = require('../policies/history-orders.server.policy');
var historyOrders = require('../controllers/history-orders.server.controller');

module.exports = function (app) {
  // historyOrders collection routes
  app
    .route('/api/historyOrders')
    .all(historyOrdersPolicy.isAllowed)
    .get(historyOrders.list)
    .post(historyOrders.create);

  // historyOrders findAll route
  app
    .route('/api/historyOrders/findAll')
    .all(historyOrdersPolicy.isAllowed)
    .get(historyOrders.listAggregate);

  //   // Single Order routes
  //   app
  //     .route('/api/historyOrders/:orderId')
  //     .all(historyOrdersPolicy.isAllowed)
  //     .get(historyOrders.read)
  //     .put(historyOrders.update)
  //     .delete(historyOrders.delete);
};
