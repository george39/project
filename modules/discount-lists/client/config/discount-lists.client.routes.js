(function () {
  'use strict';

  angular.module('discountLists.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('discountLists', {
        abstract: true,
        url: '/discountLists',
        template: '<ui-view/>'
      })
      .state('discountLists.list', {
        url: '',
        templateUrl: '/modules/discount-lists/client/views/admin/list-discount-lists.client.view.html',
        controller: 'DiscountListsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          discountListsResolve: getDiscountLists
        }
      })
      .state('discountLists.create', {
        url: '/create',
        templateUrl: '/modules/discount-lists/client/views/admin/form-discount-list.client.view.html',
        controller: 'DiscountListsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          discountListResolve: newDiscountList
        }
      })
      .state('discountLists.edit', {
        url: '/:discountListId/edit',
        templateUrl: '/modules/discount-lists/client/views/admin/form-discount-list.client.view.html',
        controller: 'DiscountListsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ discountListResolve.title }}'
        },
        resolve: {
          discountListResolve: getDiscountList
        }
      })
      .state('discountLists.view', {
        url: '/:discountListId',
        templateUrl: '/modules/discount-lists/client/views/admin/view-discount-list.client.view.html',
        controller: 'DiscountListsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ discountListResolve.title }}'
        },
        resolve: {
          discountListResolve: getDiscountList
        }
      });
  }

  getDiscountList.$inject = ['$stateParams', 'DiscountListsService'];

  function getDiscountList($stateParams, DiscountListsService) {
    return DiscountListsService.get({
      discountListId: $stateParams.discountListId
    }).$promise;
  }

  getDiscountLists.$inject = ['$stateParams', 'DiscountListsService'];

  function getDiscountLists($stateParams, DiscountListsService) {
    var filterDiscountListsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return DiscountListsService.get(filterDiscountListsService).$promise;
  }

  newDiscountList.$inject = ['DiscountListsService'];

  function newDiscountList(DiscountListsService) {
    return new DiscountListsService();
  }
})();
