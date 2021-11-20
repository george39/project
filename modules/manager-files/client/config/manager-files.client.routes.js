(function () {
  'use strict';

  angular.module('managerFiles.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('managerFiles', {
        abstract: true,
        url: '/managerFiles',
        template: '<ui-view/>'
      })
      .state('managerFiles.list', {
        url: '',
        templateUrl: '/modules/manager-files/client/views/admin/list-manager-files.client.view.html',
        controller: 'ManagerFilesListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          managerFilesResolve: getManagerFiles
        }
      })
      .state('managerFiles.create', {
        url: '/create',
        templateUrl: '/modules/manager-files/client/views/admin/form-manager-file.client.view.html',
        controller: 'ManagerFilesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          managerFileResolve: newManagerFile
        }
      })
      .state('managerFiles.edit', {
        url: '/:managerFileId/edit',
        templateUrl: '/modules/manager-files/client/views/admin/form-manager-file.client.view.html',
        controller: 'ManagerFilesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ managerFileResolve.title }}'
        },
        resolve: {
          managerFileResolve: getManagerFile
        }
      })
      .state('managerFiles.view', {
        url: '/:managerFileId',
        templateUrl: '/modules/manager-files/client/views/admin/view-manager-file.client.view.html',
        controller: 'ManagerFilesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ managerFileResolve.title }}'
        },
        resolve: {
          managerFileResolve: getManagerFile
        }
      });
  }

  getManagerFile.$inject = ['$stateParams', 'ManagerFilesService'];

  function getManagerFile($stateParams, ManagerFilesService) {
    return ManagerFilesService.get({
      managerFileId: $stateParams.managerFileId
    }).$promise;
  }

  getManagerFiles.$inject = ['$stateParams', 'ManagerFilesService'];

  function getManagerFiles($stateParams, ManagerFilesService) {
    var filterManagerFilesService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return ManagerFilesService.get(filterManagerFilesService).$promise;
  }

  newManagerFile.$inject = ['ManagerFilesService'];

  function newManagerFile(ManagerFilesService) {
    return new ManagerFilesService();
  }
})();
