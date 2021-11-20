(function () {
  'use strict';

  angular.module('core.admin.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$translateProvider'];

  function routeConfig($stateProvider, $translateProvider) {
    $stateProvider.state('admin', {
      abstract: true,
      url: '/admin',
      template: '<ui-view/>',
      data: {
        roles: ['admin']
      }
    });

    $translateProvider.useUrlLoader('/get_lang');
    $translateProvider.preferredLanguage('es');
    // $translateProvider.useCookieStorage();
    $translateProvider.useLocalStorage();
    // $translateProvider.useSanitizeValueStrategy('sanitize');
    $translateProvider.useSanitizeValueStrategy(null);
  }
})();
