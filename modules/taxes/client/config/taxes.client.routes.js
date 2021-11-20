(function () {
  'use strict';

  angular.module('taxes.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('taxes', {
        abstract: true,
        url: '/taxes',
        template: '<ui-view/>'
      })
      .state('taxes.list', {
        url: '',
        templateUrl: '/modules/taxes/client/views/admin/list-taxes.client.view.html',
        controller: 'TaxesListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          taxesResolve: getTaxes
        }
      })
      .state('taxes.create', {
        url: '/create',
        templateUrl: '/modules/taxes/client/views/admin/form-tax.client.view.html',
        controller: 'TaxesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          taxResolve: newTax
        }
      })
      .state('taxes.edit', {
        url: '/:taxId/edit',
        templateUrl: '/modules/taxes/client/views/admin/form-tax.client.view.html',
        controller: 'TaxesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ taxResolve.title }}'
        },
        resolve: {
          taxResolve: getTax
        }
      })
      .state('taxes.view', {
        url: '/:taxId',
        templateUrl: '/modules/taxes/client/views/admin/view-tax.client.view.html',
        controller: 'TaxesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ taxResolve.title }}'
        },
        resolve: {
          taxResolve: getTax
        }
      });
  }

  getTax.$inject = ['$stateParams', 'TaxesService'];

  function getTax($stateParams, TaxesService) {
    return TaxesService.get({
      taxId: $stateParams.taxId
    }).$promise;
  }

  getTaxes.$inject = ['$stateParams', 'TaxesService'];

  function getTaxes($stateParams, TaxesService) {
    var filterTaxesService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return TaxesService.get(filterTaxesService).$promise;
  }

  newTax.$inject = ['TaxesService'];

  function newTax(TaxesService) {
    return new TaxesService();
  }
})();
