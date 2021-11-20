(function (app) {
  'use strict';

  app.registerModule('langs', ['core']);
  app.registerModule('langs.admin', ['core.admin']);
  app.registerModule('langs.admin.routes', ['core.admin.routes']);
  app.registerModule('langs.services');
  app.registerModule('langs.routes', ['ui.router', 'core.routes', 'langs.services']);
})(ApplicationConfiguration);
