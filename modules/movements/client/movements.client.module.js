(function (app) {
  'use strict';

  app.registerModule('movements', ['core']);
  app.registerModule('movements.admin', ['core.admin']);
  app.registerModule('movements.admin.routes', ['core.admin.routes']);
  app.registerModule('movements.services');
  app.registerModule('movements.routes', ['ui.router', 'core.routes', 'movements.services']);
})(ApplicationConfiguration);
