'use strict';

/**
 * Module dependencies
 */
var discountListsPolicy = require('../policies/discount-lists.server.policy');
var discountLists = require('../controllers/discount-lists.server.controller');

module.exports = function (app) {
  // Discount Lists collection routes
  app.route('/api/discountLists').all(discountListsPolicy.isAllowed).get(discountLists.list).post(discountLists.create);

  // Discount Lists collection routes
  app.route('/api/discountLists/findAll').all(discountListsPolicy.isAllowed).get(discountLists.findAll);

  // Single Discount List routes
  app
    .route('/api/discountLists/:discountListId')
    .all(discountListsPolicy.isAllowed)
    .get(discountLists.read)
    .put(discountLists.update)
    .delete(discountLists.delete);

  // Finish by binding the Discount List middleware
  app.param('discountListId', discountLists.discountListByID);
};
