(function (app) {
  'use strict';

  app.registerModule('products', ['core']);
  app.registerModule('products.admin', ['core.admin']);
  app.registerModule('products.admin.routes', ['core.admin.routes']);
  app.registerModule('products.services');
  app.registerModule('products.routes', ['ui.router', 'core.routes', 'products.services']);
})(ApplicationConfiguration);
