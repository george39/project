(function (app) {
  'use strict';

  app.registerModule('groups', ['core']);
  app.registerModule('groups.admin', ['core.admin']);
  app.registerModule('groups.admin.routes', ['core.admin.routes']);
  app.registerModule('groups.services');
  app.registerModule('groups.routes', ['ui.router', 'core.routes', 'groups.services']);
})(ApplicationConfiguration);
