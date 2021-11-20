(function (app) {
  'use strict';

  app.registerModule('notifications', ['core']);
  app.registerModule('notifications.admin', ['core.admin']);
  app.registerModule('notifications.admin.routes', ['core.admin.routes']);
  app.registerModule('notifications.services');
  app.registerModule('notifications.routes', ['ui.router', 'core.routes', 'notifications.services']);
})(ApplicationConfiguration);
