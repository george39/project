(function () {
  'use strict';

  angular
    .module('groups.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('groups', {
        abstract: true,
        url: '/groups',
        template: '<ui-view/>'
      })
      .state('groups.list', {
        url: '',
        templateUrl: '/modules/groups/client/views/admin/list-groups.client.view.html',
        controller: 'GroupsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          groupsResolve: getGroups
        }
      })
      .state('groups.create', {
        url: '/create',
        templateUrl: '/modules/groups/client/views/admin/form-group.client.view.html',
        controller: 'GroupsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          groupResolve: newGroup,
          moduleResolve: getListModules
        }
      })
      .state('groups.edit', {
        url: '/:groupId/edit',
        templateUrl: '/modules/groups/client/views/admin/form-group.client.view.html',
        controller: 'GroupsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ groupResolve.title }}'
        },
        resolve: {
          groupResolve: getGroup,
          moduleResolve: getListModules
        }
      })
      .state('groups.view', {
        url: '/:groupId',
        templateUrl: '/modules/groups/client/views/admin/view-group.client.view.html',
        controller: 'GroupsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ groupResolve.title }}'
        },
        resolve: {
          groupResolve: getGroup,
          moduleResolve: getListModules
        }
      });
  }

  getGroup.$inject = ['$stateParams', 'GroupsService'];

  function getGroup($stateParams, GroupsService) {
    return GroupsService.get({
      groupId: $stateParams.groupId
    }).$promise;
  }

  getGroups.$inject = ['$stateParams', 'GroupsService'];

  function getGroups($stateParams, GroupsService) {
    var filterGroupsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return GroupsService.get(filterGroupsService).$promise;
  }

  getListModules.$inject = ['GroupsService'];

  function getListModules(GroupsService) {
    return GroupsService.prototype.getListModules();
  }

  newGroup.$inject = ['GroupsService'];

  function newGroup(GroupsService) {
    return new GroupsService();
  }
})();
