(function (app) {
  'use strict';

  app.registerModule('crafts', ['core']);
  app.registerModule('crafts.admin', ['core.admin']);
  app.registerModule('crafts.admin.routes', ['core.admin.routes']);
  app.registerModule('crafts.services');
  app.registerModule('crafts.routes', ['ui.router', 'core.routes', 'crafts.services']);
})(ApplicationConfiguration);
