(function (app) {
  'use strict';

  app.registerModule('aliases', ['core']);
  app.registerModule('aliases.admin', ['core.admin']);
  app.registerModule('aliases.admin.routes', ['core.admin.routes']);
  app.registerModule('aliases.services');
  app.registerModule('aliases.routes', ['ui.router', 'core.routes', 'aliases.services']);
})(ApplicationConfiguration);
