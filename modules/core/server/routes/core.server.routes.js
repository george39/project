'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller');
  var lang = require('../controllers/core.lang.controller');

  // Define error pages
  app.route('/server-error').get(core.renderServerError);

  // translate
  app.route('/get_lang').get(lang.getLanguaje);
  app.route('/config/:itemjson').get(lang.varsConfig);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  // Define application route
  app.route('/*').get(core.renderIndex);
};
