(function () {
  'use strict';

  angular.module('crafts.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('crafts', {
        abstract: true,
        url: '/crafts',
        template: '<ui-view/>'
      })
      .state('crafts.latest', {
        url: '',
        templateUrl: '/modules/crafts/client/views/latest-crafts.client.view.html',
        controller: 'LatestCraftsController',
        controllerAs: 'vm',
        data: {
          roles: ['guest', 'user']
        },
        css: '/modules/crafts/client/css/list-crafts.client.css',
        resolve: {
          craftResolve: newCraft,
          lastCrafts: lastCrafts,
          managerFileResolve: newManagerFile
        }
      })
      .state('crafts.list', {
        url: '/:categoryName',
        templateUrl: '/modules/crafts/client/views/list-crafts.client.view.html',
        controller: 'ListCraftsController',
        controllerAs: 'vm',
        data: {
          roles: ['guest', 'user', 'admin']
        },
        css: '/modules/crafts/client/css/list-crafts.client.css',
        resolve: {
          craftResolve: newCraft,
          managerFileResolve: newManagerFile
        }
      })
      .state('crafts.view', {
        url: '/:categoryName/:craftId',
        templateUrl: '/modules/crafts/client/views/craft.client.view.html',
        controller: 'CraftsController',
        controllerAs: 'vm',
        data: {
          roles: ['guest', 'user']
        },
        css: '/modules/crafts/client/css/list-crafts.client.css',
        resolve: {
          craftResolve: getCraft,
          lastCrafts: lastCrafts,
          managerFileResolve: newManagerFile
        }
      })
      .state('crafts-admin', {
        abstract: true,
        url: '/admin/crafts',
        template: '<ui-view/>'
      })
      .state('crafts-admin.list', {
        url: '',
        templateUrl: '/modules/crafts/client/views/admin/list-crafts.client.view.html',
        controller: 'CraftsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          craftsResolve: getCrafts
        }
      })
      .state('crafts-admin.create', {
        url: '/admin/create',
        templateUrl: '/modules/crafts/client/views/admin/form-craft.client.view.html',
        controller: 'CraftsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          craftResolve: newCraft,
          managerFileResolve: newManagerFile
        }
      })
      .state('crafts-admin.edit', {
        url: '/:craftId/edit',
        templateUrl: '/modules/crafts/client/views/admin/form-craft.client.view.html',
        controller: 'CraftsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ craftResolve.title }}'
        },
        resolve: {
          craftResolve: getCraft,
          managerFileResolve: newManagerFile
        }
      })
      .state('crafts-admin.view', {
        url: '/:craftId',
        templateUrl: '/modules/crafts/client/views/admin/view-craft.client.view.html',
        controller: 'CraftsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ craftResolve.title }}'
        },
        resolve: {
          craftResolve: getCraft,
          managerFileResolve: newManagerFile
        }
      });
  }

  getCraft.$inject = ['$stateParams', 'CraftsService'];

  function getCraft($stateParams, CraftsService) {
    return CraftsService.get({
      craftId: $stateParams.craftId,
      lang: localStorage.getItem('NG_TRANSLATE_LANG_KEY')
    }).$promise;
  }

  getCrafts.$inject = ['$stateParams', 'CraftsService'];

  function getCrafts($stateParams, CraftsService) {
    var filterCraftsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return CraftsService.get(filterCraftsService).$promise;
  }

  newCraft.$inject = ['CraftsService'];

  function newCraft(CraftsService) {
    return new CraftsService();
  }

  newManagerFile.$inject = ['ManagerFilesService'];

  function newManagerFile(ManagerFilesService) {
    return new ManagerFilesService();
  }

  lastCrafts.$inject = ['$resource'];

  function lastCrafts($resource) {
    var params = {
      filter: {},
      lang: localStorage.getItem('NG_TRANSLATE_LANG_KEY'),
      sorting: {
        modified: 'desc'
      },
      count: 8
    };

    var modules = $resource('/api/crafts');
    return modules.get(params).$promise;
  }
})();
