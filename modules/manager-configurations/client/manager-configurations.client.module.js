(function (app) {
  'use strict';

  app.registerModule('managerConfigurations', ['core']);
  app.registerModule('managerConfigurations.admin', ['core.admin']);
  app.registerModule('managerConfigurations.admin.routes', ['core.admin.routes']);
  app.registerModule('managerConfigurations.services');
  app.registerModule('managerConfigurations.routes', ['ui.router', 'core.routes', 'managerConfigurations.services']);
})(ApplicationConfiguration);
