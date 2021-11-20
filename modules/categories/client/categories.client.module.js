(function (app) {
  'use strict';

  app.registerModule('categories', ['core']);
  app.registerModule('categories.admin', ['core.admin']);
  app.registerModule('categories.admin.routes', ['core.admin.routes']);
  app.registerModule('categories.services');
  app.registerModule('categories.routes', ['ui.router', 'core.routes', 'categories.services']);
})(ApplicationConfiguration);
