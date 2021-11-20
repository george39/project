'use strict';

/**
 * Module dependencies
 */
var managerFilesPolicy = require('../policies/manager-files.server.policy');
var managerFiles = require('../controllers/manager-files.server.controller');

module.exports = function (app) {
  // Manager Files collection routes
  app.route('/api/managerFiles').all(managerFilesPolicy.isAllowed).get(managerFiles.list).post(managerFiles.create);

  // Manager Files collection routes
  app.route('/api/managerFiles/removeAllFiles').all(managerFilesPolicy.isAllowed).delete(managerFiles.removeAllFiles);

  // Single Manager File routes
  app
    .route('/api/managerFiles/:managerFileId')
    .all(managerFilesPolicy.isAllowed)
    .get(managerFiles.read)
    .put(managerFiles.update)
    .delete(managerFiles.delete);

  // Finish by binding the Manager File middleware
  app.param('managerFileId', managerFiles.managerFileByID);
};
