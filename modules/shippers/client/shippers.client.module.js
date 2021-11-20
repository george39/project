(function (app) {
  'use strict';

  app.registerModule('shippers', ['core']);
  app.registerModule('shippers.admin', ['core.admin']);
  app.registerModule('shippers.admin.routes', ['core.admin.routes']);
  app.registerModule('shippers.services');
  app.registerModule('shippers.routes', ['ui.router', 'core.routes', 'shippers.services']);
})(ApplicationConfiguration);
