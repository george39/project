(function (app) {
  'use strict';

  app.registerModule('featureDetails', ['core']);
  app.registerModule('featureDetails.admin', ['core.admin']);
  app.registerModule('featureDetails.admin.routes', ['core.admin.routes']);
  app.registerModule('featureDetails.services');
  app.registerModule('featureDetails.routes', ['ui.router', 'core.routes', 'featureDetails.services']);
})(ApplicationConfiguration);
