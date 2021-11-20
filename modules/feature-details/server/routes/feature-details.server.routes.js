'use strict';

/**
 * Module dependencies
 */
var featureDetailsPolicy = require('../policies/feature-details.server.policy');
var featureDetails = require('../controllers/feature-details.server.controller');

module.exports = function (app) {
  // Feature Details collection routes
  app.route('/api/featureDetails').all(featureDetailsPolicy.isAllowed).get(featureDetails.list).post(featureDetails.create);

  // Feature Details findAll route
  app.route('/api/featureDetails/findAll').all(featureDetailsPolicy.isAllowed).get(featureDetails.findAll);

  // Single Feature Detail routes
  app
    .route('/api/featureDetails/:featureDetailId')
    .all(featureDetailsPolicy.isAllowed)
    .get(featureDetails.read)
    .put(featureDetails.update)
    .delete(featureDetails.delete);

  // Finish by binding the Feature Detail middleware
  app.param('featureDetailId', featureDetails.featureDetailByID);
};
