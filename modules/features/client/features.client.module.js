(function (app) {
  'use strict';

  app.registerModule('features', ['core']);
  app.registerModule('features.admin', ['core.admin']);
  app.registerModule('features.admin.routes', ['core.admin.routes']);
  app.registerModule('features.services');
  app.registerModule('features.routes', ['ui.router', 'core.routes', 'features.services']);
})(ApplicationConfiguration);
