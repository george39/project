(function () {
  'use strict';

  angular.module('langs.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('langs', {
        abstract: true,
        url: '/langs',
        template: '<ui-view/>'
      })
      .state('langs.list', {
        url: '',
        templateUrl: '/modules/langs/client/views/admin/list-langs.client.view.html',
        controller: 'LangsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          langsResolve: getLangs,
          managerFileResolve: newManagerFile
        }
      })
      .state('langs.create', {
        url: '/create',
        templateUrl: '/modules/langs/client/views/admin/form-lang.client.view.html',
        controller: 'LangsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          langResolve: newLang,
          managerFileResolve: newManagerFile
        }
      })
      .state('langs.edit', {
        url: '/:langId/edit',
        templateUrl: '/modules/langs/client/views/admin/form-lang.client.view.html',
        controller: 'LangsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ langResolve.title }}'
        },
        resolve: {
          langResolve: getLang,
          managerFileResolve: newManagerFile
        }
      })
      .state('langs.editFile', {
        url: '/:langId/editFile',
        templateUrl: '/modules/langs/client/views/admin/form-manager-translate.client.view.html',
        controller: 'ManagerTranslatesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ langResolve.title }}'
        },
        resolve: {
          langResolve: getLang,
          fileLangResolve: getFileLang
        }
      })
      .state('langs.view', {
        url: '/:langId',
        templateUrl: '/modules/langs/client/views/admin/view-lang.client.view.html',
        controller: 'LangsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ langResolve.title }}'
        },
        resolve: {
          langResolve: getLang,
          managerFileResolve: newManagerFile
        }
      });
  }

  getLang.$inject = ['$stateParams', 'LangsService'];

  function getLang($stateParams, LangsService) {
    return LangsService.get({
      langId: $stateParams.langId
    }).$promise;
  }

  getFileLang.$inject = ['$stateParams', 'LangsService'];

  function getFileLang($stateParams, LangsService) {
    return LangsService.prototype.getFileLang({
      langId: $stateParams.langId
    });
  }

  getLangs.$inject = ['$stateParams', 'LangsService'];

  function getLangs($stateParams, LangsService) {
    var filterLangsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return LangsService.get(filterLangsService).$promise;
  }

  newLang.$inject = ['LangsService'];

  function newLang(LangsService) {
    return new LangsService();
  }

  newManagerFile.$inject = ['ManagerFilesService'];

  function newManagerFile(ManagerFilesService) {
    return new ManagerFilesService();
  }
})();
