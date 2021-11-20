'use strict';

/**
 * Module dependencies
 */
const discountMassivesPolicy = require('../policies/discount-massives.server.policy');
const discountMassives = require('../controllers/discount-massives.server.controller');

module.exports = function (app) {
  // Discount Massives collection routes
  app
    .route('/api/discountMassives')
    .all(discountMassivesPolicy.isAllowed)
    .get(discountMassives.list)
    .post(discountMassives.create);

  // Discount Massives findAll route
  app
    .route('/api/discountMassives/findAll')
    .all(discountMassivesPolicy.isAllowed)
    .get(discountMassives.findAll);

  // Single Discount Massive routes
  app
    .route('/api/discountMassives/:discountId/override')
    .all(discountMassivesPolicy.isAllowed)
    .post(discountMassives.overrideProducts);

  app
    .route('/api/discountMassives/:discountMassiveId')
    .all(discountMassivesPolicy.isAllowed)
    .get(discountMassives.read)
    .put(discountMassives.update)
    .delete(discountMassives.delete);

  // Finish by binding the Discount Massive middleware
  app.param('discountMassiveId', discountMassives.discountMassiveByID);
};
