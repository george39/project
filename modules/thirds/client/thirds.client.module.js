(function (app) {
  'use strict';

  app.registerModule('thirds', ['core']);
  app.registerModule('thirds.admin', ['core.admin']);
  app.registerModule('thirds.admin.routes', ['core.admin.routes']);
  app.registerModule('thirds.services');
  app.registerModule('thirds.routes', ['ui.router', 'core.routes', 'thirds.services']);
})(ApplicationConfiguration);
