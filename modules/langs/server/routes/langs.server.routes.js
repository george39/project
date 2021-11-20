'use strict';

/**
 * Module dependencies
 */
var langsPolicy = require('../policies/langs.server.policy');
var langs = require('../controllers/langs.server.controller');

module.exports = function (app) {
  // Langs collection routes
  app.route('/api/langs').all(langsPolicy.isAllowed).get(langs.list).post(langs.create);

  // Langs collection routes
  app.route('/api/langs/getFileLang').all(langsPolicy.isAllowed).get(langs.getFileLang);

  // Single Lang routes
  app.route('/api/langs/:langId').all(langsPolicy.isAllowed).get(langs.read).put(langs.update).delete(langs.delete);

  // Finish by binding the Lang middleware
  app.param('langId', langs.langByID);
};
