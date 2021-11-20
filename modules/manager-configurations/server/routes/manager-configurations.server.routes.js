'use strict';

/**
 * Module dependencies
 */
var managerConfigurationsPolicy = require('../policies/manager-configurations.server.policy');
var managerConfigurations = require('../controllers/manager-configurations.server.controller');

module.exports = function (app) {
  // Manager Configurations collection routes
  app
    .route('/api/managerConfigurations')
    .all(managerConfigurationsPolicy.isAllowed)
    .get(managerConfigurations.list)
    .post(managerConfigurations.create);

  // Single Manager Configuration routes
  app
    .route('/api/managerConfigurations/:managerConfigurationId')
    .all(managerConfigurationsPolicy.isAllowed)
    .get(managerConfigurations.read)
    .put(managerConfigurations.update)
    .delete(managerConfigurations.delete);

  // Finish by binding the Manager Configuration middleware
  app.param('managerConfigurationId', managerConfigurations.managerConfigurationByID);
};
