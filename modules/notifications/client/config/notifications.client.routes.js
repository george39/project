(function () {
  'use strict';

  angular.module('notifications.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('notifications', {
        abstract: true,
        url: '/notifications',
        template: '<ui-view/>'
      })
      .state('notifications.list', {
        url: '',
        templateUrl: '/modules/notifications/client/views/admin/list-notifications.client.view.html',
        controller: 'NotificationsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          notificationsResolve: getNotifications
        }
      })
      .state('notifications.create', {
        url: '/create',
        templateUrl: '/modules/notifications/client/views/admin/form-notification.client.view.html',
        controller: 'NotificationsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          notificationResolve: newNotification
        }
      })
      .state('notifications.edit', {
        url: '/:notificationId/edit',
        templateUrl: '/modules/notifications/client/views/admin/form-notification.client.view.html',
        controller: 'NotificationsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ notificationResolve.title }}'
        },
        resolve: {
          notificationResolve: getNotification
        }
      })
      .state('notifications.view', {
        url: '/:notificationId',
        templateUrl: '/modules/notifications/client/views/admin/view-notification.client.view.html',
        controller: 'NotificationsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ notificationResolve.title }}'
        },
        resolve: {
          notificationResolve: getNotification
        }
      });
  }

  getNotification.$inject = ['$stateParams', 'NotificationsService'];

  function getNotification($stateParams, NotificationsService) {
    return NotificationsService.get({
      notificationId: $stateParams.notificationId
    }).$promise;
  }

  getNotifications.$inject = ['$stateParams', 'NotificationsService'];

  function getNotifications($stateParams, NotificationsService) {
    var filterNotificationsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return NotificationsService.get(filterNotificationsService).$promise;
  }

  newNotification.$inject = ['NotificationsService'];

  function newNotification(NotificationsService) {
    return new NotificationsService();
  }
})();
