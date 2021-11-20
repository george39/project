(function () {
  'use strict';

  angular.module('thirds.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('thirds', {
        abstract: true,
        url: '/thirds',
        template: '<ui-view/>'
      })
      .state('thirds.list', {
        url: '',
        templateUrl: '/modules/thirds/client/views/admin/list-thirds.client.view.html',
        controller: 'ThirdsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          thirdsResolve: getThirds
        }
      })
      .state('thirds.create', {
        url: '/create',
        templateUrl: '/modules/thirds/client/views/admin/form-third.client.view.html',
        controller: 'ThirdsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          thirdResolve: newThird
        }
      })
      .state('thirds.edit', {
        url: '/:thirdId/edit',
        templateUrl: '/modules/thirds/client/views/admin/form-third.client.view.html',
        controller: 'ThirdsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ thirdResolve.title }}'
        },
        resolve: {
          thirdResolve: getThird
        }
      })
      .state('thirds.view', {
        url: '/:thirdId',
        templateUrl: '/modules/thirds/client/views/admin/view-third.client.view.html',
        controller: 'ThirdsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ thirdResolve.title }}'
        },
        resolve: {
          thirdResolve: getThird
        }
      });
  }

  getThird.$inject = ['$stateParams', 'ThirdsService'];

  function getThird($stateParams, ThirdsService) {
    return ThirdsService.get({
      thirdId: $stateParams.thirdId
    }).$promise;
  }

  getThirds.$inject = ['$stateParams', 'ThirdsService'];

  function getThirds($stateParams, ThirdsService) {
    var filterThirdsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return ThirdsService.get(filterThirdsService).$promise;
  }

  newThird.$inject = ['ThirdsService'];

  function newThird(ThirdsService) {
    return new ThirdsService();
  }
})();
