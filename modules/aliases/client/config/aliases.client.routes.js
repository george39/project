(function () {
  'use strict';

  angular.module('aliases.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('aliases', {
        abstract: true,
        url: '/aliases',
        template: '<ui-view/>'
      })
      .state('aliases.list', {
        url: '',
        templateUrl: '/modules/aliases/client/views/admin/list-aliases.client.view.html',
        controller: 'AliasesListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          aliasesResolve: getAliases
        }
      })
      .state('aliases.create', {
        url: '/create',
        templateUrl: '/modules/aliases/client/views/admin/form-alias.client.view.html',
        controller: 'AliasesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          aliasResolve: newAlias
        }
      })
      .state('aliases.edit', {
        url: '/:aliasId/edit',
        templateUrl: '/modules/aliases/client/views/admin/form-alias.client.view.html',
        controller: 'AliasesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ aliasResolve.title }}'
        },
        resolve: {
          aliasResolve: getAlias
        }
      })
      .state('aliases.view', {
        url: '/:aliasId',
        templateUrl: '/modules/aliases/client/views/admin/view-alias.client.view.html',
        controller: 'AliasesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ aliasResolve.title }}'
        },
        resolve: {
          aliasResolve: getAlias
        }
      });
  }

  getAlias.$inject = ['$stateParams', 'AliasesService'];

  function getAlias($stateParams, AliasesService) {
    return AliasesService.get({
      aliasId: $stateParams.aliasId
    }).$promise;
  }

  getAliases.$inject = ['$stateParams', 'AliasesService'];

  function getAliases($stateParams, AliasesService) {
    var filterAliasesService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return AliasesService.get(filterAliasesService).$promise;
  }

  newAlias.$inject = ['AliasesService'];

  function newAlias(AliasesService) {
    return new AliasesService();
  }
})();
