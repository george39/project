(function () {
  'use strict';

  angular.module('managerConfigurations.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('managerConfigurations', {
        abstract: true,
        url: '/managerConfigurations',
        template: '<ui-view/>'
      })
      .state('managerConfigurations.list', {
        url: '',
        templateUrl:
          '/modules/manager-configurations/client/views/admin/list-manager-configurations.client.view.html',
        controller: 'ManagerConfigurationsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          managerConfigurationsResolve: getManagerConfigurations
        }
      })
      .state('managerConfigurations.create', {
        url: '/create',
        templateUrl:
          '/modules/manager-configurations/client/views/admin/form-manager-configuration.client.view.html',
        controller: 'ManagerConfigurationsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          managerConfigurationResolve: newManagerConfiguration
        }
      })
      .state('managerConfigurations.edit', {
        url: '/:managerConfigurationId/edit',
        templateUrl:
          '/modules/manager-configurations/client/views/admin/form-manager-configuration.client.view.html',
        controller: 'ManagerConfigurationsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ managerConfigurationResolve.title }}'
        },
        resolve: {
          managerConfigurationResolve: getManagerConfiguration
        }
      })
      .state('managerConfigurations.images', {
        url: '/:managerConfigurationId/images',
        templateUrl:
          '/modules/manager-configurations/client/views/admin/images-manager-configuration.client.view.html',
        controller: 'ImagesManagerConfigurationsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ managerConfigurationResolve.title }}'
        },
        resolve: {
          managerConfigurationResolve: getManagerConfiguration
        }
      })
      .state('managerConfigurations.view', {
        url: '/:managerConfigurationId',
        templateUrl:
          '/modules/manager-configurations/client/views/admin/view-manager-configuration.client.view.html',
        controller: 'ManagerConfigurationsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ managerConfigurationResolve.title }}'
        },
        resolve: {
          managerConfigurationResolve: getManagerConfiguration
        }
      });
  }

  getManagerConfiguration.$inject = ['$stateParams', 'ManagerConfigurationsService'];

  function getManagerConfiguration($stateParams, ManagerConfigurationsService) {
    return ManagerConfigurationsService.get({
      managerConfigurationId: $stateParams.managerConfigurationId
    }).$promise;
  }

  getManagerConfigurations.$inject = ['$stateParams', 'ManagerConfigurationsService'];

  function getManagerConfigurations($stateParams, ManagerConfigurationsService) {
    var filterManagerConfigurationsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return ManagerConfigurationsService.get(filterManagerConfigurationsService).$promise;
  }

  newManagerConfiguration.$inject = ['ManagerConfigurationsService'];

  function newManagerConfiguration(ManagerConfigurationsService) {
    return new ManagerConfigurationsService();
  }
})();
