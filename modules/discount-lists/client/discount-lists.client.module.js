(function (app) {
  'use strict';

  app.registerModule('discountLists', ['core']);
  app.registerModule('discountLists.admin', ['core.admin']);
  app.registerModule('discountLists.admin.routes', ['core.admin.routes']);
  app.registerModule('discountLists.services');
  app.registerModule('discountLists.routes', ['ui.router', 'core.routes', 'discountLists.services']);
})(ApplicationConfiguration);
