(function () {
  'use strict';

  angular.module('discountMassives.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('discountMassives', {
        abstract: true,
        url: '/discountMassives',
        template: '<ui-view/>'
      })
      .state('discountMassives.list', {
        url: '',
        templateUrl: '/modules/discount-massives/client/views/admin/list-discount-massives.client.view.html',
        controller: 'DiscountMassivesListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          discountMassivesResolve: getDiscountMassives
        }
      })
      .state('discountMassives.create', {
        url: '/create',
        templateUrl: '/modules/discount-massives/client/views/admin/form-discount-massive.client.view.html',
        controller: 'DiscountMassivesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          discountMassiveResolve: newDiscountMassive
        }
      })
      .state('discountMassives.edit', {
        url: '/:discountMassiveId/edit',
        templateUrl: '/modules/discount-massives/client/views/admin/form-discount-massive.client.view.html',
        controller: 'DiscountMassivesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ discountMassiveResolve.title }}'
        },
        resolve: {
          discountMassiveResolve: getDiscountMassive
        }
      })
      .state('discountMassives.view', {
        url: '/:discountMassiveId',
        templateUrl: '/modules/discount-massives/client/views/admin/view-discount-massive.client.view.html',
        controller: 'DiscountMassivesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ discountMassiveResolve.title }}'
        },
        resolve: {
          discountMassiveResolve: getDiscountMassive
        }
      });
  }

  getDiscountMassive.$inject = ['$stateParams', 'DiscountMassivesService'];

  function getDiscountMassive($stateParams, DiscountMassivesService) {
    return DiscountMassivesService.get({
      discountMassiveId: $stateParams.discountMassiveId
    }).$promise;
  }

  getDiscountMassives.$inject = ['$stateParams', 'DiscountMassivesService'];

  function getDiscountMassives($stateParams, DiscountMassivesService) {
    var filterDiscountMassivesService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return DiscountMassivesService.get(filterDiscountMassivesService).$promise;
  }

  newDiscountMassive.$inject = ['DiscountMassivesService'];

  function newDiscountMassive(DiscountMassivesService) {
    return new DiscountMassivesService();
  }
})();
