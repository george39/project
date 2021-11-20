(function () {
  'use strict';

  angular.module('shippers.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('shippers', {
        abstract: true,
        url: '/shippers',
        template: '<ui-view/>'
      })
      .state('shippers.list', {
        url: '',
        templateUrl: '/modules/shippers/client/views/admin/list-shippers.client.view.html',
        controller: 'ShippersListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          shippersResolve: getShippers,
          managerFileResolve: newManagerFile
        }
      })
      .state('shippers.create', {
        url: '/create',
        templateUrl: '/modules/shippers/client/views/admin/form-shipper.client.view.html',
        controller: 'ShippersController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          shipperResolve: newShipper,
          managerFileResolve: newManagerFile
        }
      })
      .state('shippers.edit', {
        url: '/:shipperId/edit',
        templateUrl: '/modules/shippers/client/views/admin/form-shipper.client.view.html',
        controller: 'ShippersController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ shipperResolve.title }}'
        },
        resolve: {
          shipperResolve: getShipper,
          managerFileResolve: newManagerFile
        }
      })
      .state('shippers.view', {
        url: '/:shipperId',
        templateUrl: '/modules/shippers/client/views/admin/view-shipper.client.view.html',
        controller: 'ShippersController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ shipperResolve.title }}'
        },
        resolve: {
          shipperResolve: getShipper,
          managerFileResolve: newManagerFile
        }
      });
  }

  getShipper.$inject = ['$stateParams', 'ShippersService'];

  function getShipper($stateParams, ShippersService) {
    return ShippersService.get({
      shipperId: $stateParams.shipperId
    }).$promise;
  }

  getShippers.$inject = ['$stateParams', 'ShippersService'];

  function getShippers($stateParams, ShippersService) {
    var filterShippersService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return ShippersService.get(filterShippersService).$promise;
  }

  newShipper.$inject = ['ShippersService'];

  function newShipper(ShippersService) {
    return new ShippersService();
  }

  newManagerFile.$inject = ['ManagerFilesService'];

  function newManagerFile(ManagerFilesService) {
    return new ManagerFilesService();
  }
})();
