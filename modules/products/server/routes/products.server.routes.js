'use strict';

/**
 * Module dependencies
 */
const productsPolicy = require('../policies/products.server.policy');
const products = require('../controllers/products.server.controller');

module.exports = function (app) {
  // Products collection routes
  app.route('/api/products').all(productsPolicy.isAllowed).get(products.list).post(products.create);

  // Products findAll
  app.route('/api/products/findAll').all(productsPolicy.isAllowed).get(products.findAll);
  app.route('/api/products/getProducts').all(productsPolicy.isAllowed).get(products.listAggregate);

  app
    .route('/api/products/massiveDiscounts')
    .all(productsPolicy.isAllowed)
    .get(products.massiveDiscountsProducts);

  app
    .route('/api/products/getSectionsByCategory')
    .all(productsPolicy.isAllowed)
    .get(products.getSectionsByCategory);

  app.route('/api/products/purchase').post(products.purchase);
  // Single Product routes
  app
    .route('/api/products/:productId')
    .all(productsPolicy.isAllowed)
    .get(products.read)
    .put(products.update)
    .delete(products.delete);

  // Finish by binding the Product middleware
  app.param('productId', products.productByID);
};
