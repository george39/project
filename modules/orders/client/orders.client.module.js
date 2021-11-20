(function (app) {
  'use strict';

  app.registerModule('orders', ['core']);
  app.registerModule('orders.admin', ['core.admin']);
  app.registerModule('orders.admin.routes', ['core.admin.routes']);
  app.registerModule('orders.services');
  app.registerModule('orders.routes', ['ui.router', 'core.routes', 'orders.services']);
})(ApplicationConfiguration);
