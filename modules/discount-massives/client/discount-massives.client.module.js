(function (app) {
  'use strict';

  app.registerModule('discountMassives', ['core']);
  app.registerModule('discountMassives.admin', ['core.admin']);
  app.registerModule('discountMassives.admin.routes', ['core.admin.routes']);
  app.registerModule('discountMassives.services');
  app.registerModule('discountMassives.routes', ['ui.router', 'core.routes', 'discountMassives.services']);
})(ApplicationConfiguration);
