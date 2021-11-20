'use strict';

/**
 * Module dependencies
 */
var categoriesPolicy = require('../policies/categories.server.policy');
var categories = require('../controllers/categories.server.controller');

module.exports = function (app) {
  // Categories collection routes
  app
    .route('/api/categories')
    .all(categoriesPolicy.isAllowed)
    .get(categories.list)
    .post(categories.create);

  app.route('/api/categories/findAll').all(categoriesPolicy.isAllowed).get(categories.findAll);
  app
    .route('/api/categories/crafts')
    .all(categoriesPolicy.isAllowed)
    .get(categories.getCraftsCategories);
  app
    .route('/api/categories/findCategories')
    .all(categoriesPolicy.isAllowed)
    .get(categories.findCategories);

  // Single Category routes
  app
    .route('/api/categories/:categoryId')
    .all(categoriesPolicy.isAllowed)
    .get(categories.read)
    .put(categories.update)
    .delete(categories.delete);

  // Finish by binding the Category middleware
  app.param('categoryId', categories.categoryByID);
};
