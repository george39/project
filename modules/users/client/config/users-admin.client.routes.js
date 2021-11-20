(function () {
  'use strict';

  // Setting up route
  angular.module('users.admin.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: '/modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: '/modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser,
          groupsResolve: getGroups,
          shopsResolve: getShops
        },
        data: {
          pageTitle: '{{ userResolve.displayName }}'
        }
      })
      .state('admin.view-user-profile', {
        url: '/users/:userId/profile',
        templateUrl: '/modules/users/client/views/view-user-profile.client.view.html',
        controller: 'ViewUserProfileController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: '/modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser,
          groupsResolve: getGroups,
          shopsResolve: getShops
        },
        data: {
          pageTitle: '{{ userResolve.displayName }}'
        }
      })
      .state('admin.user-create', {
        url: '/users/create',
        templateUrl: '/modules/users/client/views/admin/create-user.client.view.html',
        controller: 'CreateUserController',
        controllerAs: 'vm',
        resolve: {
          groupsResolve: getGroups,
          shopsResolve: getShops
        },
        data: {
          pageTitle: '{{ userResolve.displayName }}'
        }
      })
      .state('admin.user-address-edit', {
        url: '/users/:userId/:addressId/edit',
        templateUrl: '/modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser,
          groupsResolve: getGroups,
          shopsResolve: getShops
        },
        data: {
          pageTitle: '{{ userResolve.displayName }}'
        }
      });

    getUser.$inject = ['$stateParams', 'AdminService'];

    function getUser($stateParams, AdminService) {
      return AdminService.get({
        userId: $stateParams.userId
      }).$promise;
    }

    getGroups.$inject = ['AdminService'];

    function getGroups(AdminService) {
      return AdminService.findAllGroups({});
    }

    getShops.$inject = ['AdminService'];

    function getShops(AdminService) {
      return AdminService.findAllShops({});
    }
  }
})();
