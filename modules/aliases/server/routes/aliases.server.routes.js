'use strict';

/**
 * Module dependencies
 */
var aliasesPolicy = require('../policies/aliases.server.policy');
var aliases = require('../controllers/aliases.server.controller');

module.exports = function (app) {
  // Aliases collection routes
  app.route('/api/aliases').all(aliasesPolicy.isAllowed).get(aliases.list).post(aliases.create);

  // Aliases findAll route
  app.route('/api/aliases/findAll').all(aliasesPolicy.isAllowed).get(aliases.findAll);

  // Single Alias routes
  app
    .route('/api/aliases/:aliasId')
    .all(aliasesPolicy.isAllowed)
    .get(aliases.read)
    .put(aliases.update)
    .delete(aliases.delete);

  // Finish by binding the Alias middleware
  app.param('aliasId', aliases.aliasByID);
};
