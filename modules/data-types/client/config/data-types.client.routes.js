(function () {
  'use strict';

  angular.module('dataTypes.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('dataTypes', {
        abstract: true,
        url: '/dataTypes',
        template: '<ui-view/>'
      })
      .state('dataTypes.list', {
        url: '',
        templateUrl: '/modules/data-types/client/views/admin/list-data-types.client.view.html',
        controller: 'DataTypesListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          dataTypesResolve: getDataTypes
        }
      })
      .state('dataTypes.create', {
        url: '/create',
        templateUrl: '/modules/data-types/client/views/admin/form-data-type.client.view.html',
        controller: 'DataTypesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          dataTypeResolve: newDataType
        }
      })
      .state('dataTypes.edit', {
        url: '/:dataTypeId/edit',
        templateUrl: '/modules/data-types/client/views/admin/form-data-type.client.view.html',
        controller: 'DataTypesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ dataTypeResolve.title }}'
        },
        resolve: {
          dataTypeResolve: getDataType
        }
      })
      .state('dataTypes.view', {
        url: '/:dataTypeId',
        templateUrl: '/modules/data-types/client/views/admin/view-data-type.client.view.html',
        controller: 'DataTypesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ dataTypeResolve.title }}'
        },
        resolve: {
          dataTypeResolve: getDataType
        }
      });
  }

  getDataType.$inject = ['$stateParams', 'DataTypesService'];

  function getDataType($stateParams, DataTypesService) {
    return DataTypesService.get({
      dataTypeId: $stateParams.dataTypeId
    }).$promise;
  }

  getDataTypes.$inject = ['$stateParams', 'DataTypesService'];

  function getDataTypes($stateParams, DataTypesService) {
    var filterDataTypesService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return DataTypesService.get(filterDataTypesService).$promise;
  }

  newDataType.$inject = ['DataTypesService'];

  function newDataType(DataTypesService) {
    return new DataTypesService();
  }
})();
