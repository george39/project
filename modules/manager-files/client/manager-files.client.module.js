(function (app) {
  'use strict';

  app.registerModule('managerFiles', ['core']);
  app.registerModule('managerFiles.admin', ['core.admin']);
  app.registerModule('managerFiles.admin.routes', ['core.admin.routes']);
  app.registerModule('managerFiles.services');
  app.registerModule('managerFiles.routes', ['ui.router', 'core.routes', 'managerFiles.services']);
})(ApplicationConfiguration);
