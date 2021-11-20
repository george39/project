(function (app) {
  'use strict';

  app.registerModule('dataTypes', ['core']);
  app.registerModule('dataTypes.admin', ['core.admin']);
  app.registerModule('dataTypes.admin.routes', ['core.admin.routes']);
  app.registerModule('dataTypes.services');
  app.registerModule('dataTypes.routes', ['ui.router', 'core.routes', 'dataTypes.services']);
})(ApplicationConfiguration);
