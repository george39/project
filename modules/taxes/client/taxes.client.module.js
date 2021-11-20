(function (app) {
  'use strict';

  app.registerModule('taxes', ['core']);
  app.registerModule('taxes.admin', ['core.admin']);
  app.registerModule('taxes.admin.routes', ['core.admin.routes']);
  app.registerModule('taxes.services');
  app.registerModule('taxes.routes', ['ui.router', 'core.routes', 'taxes.services']);
})(ApplicationConfiguration);
