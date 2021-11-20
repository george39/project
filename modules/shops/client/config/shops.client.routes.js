(function () {
  'use strict';

  angular.module('shops.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('shops', {
        abstract: true,
        url: '/shops',
        template: '<ui-view/>'
      })
      .state('shops.list', {
        url: '',
        templateUrl: '/modules/shops/client/views/admin/list-shops.client.view.html',
        controller: 'ShopsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          shopsResolve: getShops,
          managerFileResolve: newManagerFile
        }
      })
      .state('shops.create', {
        url: '/create',
        templateUrl: '/modules/shops/client/views/admin/form-shop.client.view.html',
        controller: 'ShopsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          shopResolve: newShop,
          managerFileResolve: newManagerFile
        }
      })
      .state('shops.edit', {
        url: '/:shopId/edit',
        templateUrl: '/modules/shops/client/views/admin/form-shop.client.view.html',
        controller: 'ShopsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ shopResolve.title }}'
        },
        resolve: {
          shopResolve: getShop,
          managerFileResolve: newManagerFile
        }
      })
      .state('shops.view', {
        url: '/:shopId',
        templateUrl: '/modules/shops/client/views/admin/view-shop.client.view.html',
        controller: 'ShopsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ shopResolve.title }}'
        },
        resolve: {
          shopResolve: getShop,
          managerFileResolve: newManagerFile
        }
      });
  }

  getShop.$inject = ['$stateParams', 'ShopsService'];

  function getShop($stateParams, ShopsService) {
    return ShopsService.get({
      shopId: $stateParams.shopId
    }).$promise;
  }

  getShops.$inject = ['$stateParams', 'ShopsService'];

  function getShops($stateParams, ShopsService) {
    var filterShopsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return ShopsService.get(filterShopsService).$promise;
  }

  newShop.$inject = ['ShopsService'];

  function newShop(ShopsService) {
    return new ShopsService();
  }

  newManagerFile.$inject = ['ManagerFilesService'];

  function newManagerFile(ManagerFilesService) {
    return new ManagerFilesService();
  }
})();
