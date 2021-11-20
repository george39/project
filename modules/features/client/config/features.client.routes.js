(function () {
  'use strict';

  angular.module('features.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('features', {
        abstract: true,
        url: '/features',
        template: '<ui-view/>'
      })
      .state('features.list', {
        url: '',
        templateUrl: '/modules/features/client/views/admin/list-features.client.view.html',
        controller: 'FeaturesListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          featuresResolve: getFeatures
        }
      })
      .state('features.create', {
        url: '/create',
        templateUrl: '/modules/features/client/views/admin/form-feature.client.view.html',
        controller: 'FeaturesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          featureResolve: newFeature
        }
      })
      .state('features.edit', {
        url: '/:featureId/edit',
        templateUrl: '/modules/features/client/views/admin/form-feature.client.view.html',
        controller: 'FeaturesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ featureResolve.title }}'
        },
        resolve: {
          featureResolve: getFeature
        }
      })
      .state('features.view', {
        url: '/:featureId',
        templateUrl: '/modules/features/client/views/admin/view-feature.client.view.html',
        controller: 'FeaturesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ featureResolve.title }}'
        },
        resolve: {
          featureResolve: getFeature
        }
      });
  }

  getFeature.$inject = ['$stateParams', 'FeaturesService'];

  function getFeature($stateParams, FeaturesService) {
    return FeaturesService.get({
      featureId: $stateParams.featureId
    }).$promise;
  }

  getFeatures.$inject = ['$stateParams', 'FeaturesService'];

  function getFeatures($stateParams, FeaturesService) {
    var filterFeaturesService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return FeaturesService.get(filterFeaturesService).$promise;
  }

  newFeature.$inject = ['FeaturesService'];

  function newFeature(FeaturesService) {
    return new FeaturesService();
  }
})();
