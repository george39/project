'use strict';

/**
 * Module dependencies
 */
var dataTypesPolicy = require('../policies/data-types.server.policy');
var dataTypes = require('../controllers/data-types.server.controller');

module.exports = function (app) {
  // Data Types collection routes
  app
    .route('/api/dataTypes')
    .all(dataTypesPolicy.isAllowed)
    .get(dataTypes.list)
    .post(dataTypes.create);

  // Data Types findAll route
  app.route('/api/dataTypes/findAll').all(dataTypesPolicy.isAllowed).get(dataTypes.findAll);
  app.route('/api/dataTypes/getShippers').all(dataTypesPolicy.isAllowed).get(dataTypes.getShippers);

  // Single Data Type routes
  app
    .route('/api/dataTypes/:dataTypeId')
    .all(dataTypesPolicy.isAllowed)
    .get(dataTypes.read)
    .put(dataTypes.update)
    .delete(dataTypes.delete);

  // Finish by binding the Data Type middleware
  app.param('dataTypeId', dataTypes.dataTypeByID);
};
