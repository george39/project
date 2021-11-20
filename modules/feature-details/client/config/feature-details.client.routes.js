(function () {
  'use strict';

  angular.module('featureDetails.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('featureDetails', {
        abstract: true,
        url: '/featureDetails',
        template: '<ui-view/>'
      })
      .state('featureDetails.list', {
        url: '',
        templateUrl: '/modules/feature-details/client/views/admin/list-feature-details.client.view.html',
        controller: 'FeatureDetailsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          featureDetailsResolve: getFeatureDetails
        }
      })
      .state('featureDetails.create', {
        url: '/create',
        templateUrl: '/modules/feature-details/client/views/admin/form-feature-detail.client.view.html',
        controller: 'FeatureDetailsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          featureDetailResolve: newFeatureDetail
        }
      })
      .state('featureDetails.edit', {
        url: '/:featureDetailId/edit',
        templateUrl: '/modules/feature-details/client/views/admin/form-feature-detail.client.view.html',
        controller: 'FeatureDetailsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ featureDetailResolve.title }}'
        },
        resolve: {
          featureDetailResolve: getFeatureDetail
        }
      })
      .state('featureDetails.view', {
        url: '/:featureDetailId',
        templateUrl: '/modules/feature-details/client/views/admin/view-feature-detail.client.view.html',
        controller: 'FeatureDetailsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ featureDetailResolve.title }}'
        },
        resolve: {
          featureDetailResolve: getFeatureDetail
        }
      });
  }

  getFeatureDetail.$inject = ['$stateParams', 'FeatureDetailsService'];

  function getFeatureDetail($stateParams, FeatureDetailsService) {
    return FeatureDetailsService.get({
      featureDetailId: $stateParams.featureDetailId
    }).$promise;
  }

  getFeatureDetails.$inject = ['$stateParams', 'FeatureDetailsService'];

  function getFeatureDetails($stateParams, FeatureDetailsService) {
    var filterFeatureDetailsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return FeatureDetailsService.get(filterFeatureDetailsService).$promise;
  }

  newFeatureDetail.$inject = ['FeatureDetailsService'];

  function newFeatureDetail(FeatureDetailsService) {
    return new FeatureDetailsService();
  }
})();
