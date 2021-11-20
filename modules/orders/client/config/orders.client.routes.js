(function () {
  'use strict';

  angular.module('orders.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('orders', {
        abstract: true,
        url: '/orders',
        template: '<ui-view/>'
      })
      .state('orders.list', {
        url: '',
        templateUrl: '/modules/orders/client/views/admin/list-orders.client.view.html',
        controller: 'OrdersListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          ordersResolve: getOrders
        }
      })
      .state('orders.myOrders', {
        url: '/myOrders',
        templateUrl: '/modules/orders/client/views/my-orders.client.view.html',
        controller: 'MyOrdersController',
        controllerAs: 'vm',
        data: {
          roles: ['user']
        },
        resolve: {
          ordersResolve: myOrders,
          managerFileResolve: newManagerFile,
          orderResolve: newOrder
        }
      })
      // .state('orders.create', {
      //   url: '/create',
      //   templateUrl: '/modules/orders/client/views/admin/form-order.client.view.html',
      //   controller: 'OrdersController',
      //   controllerAs: 'vm',
      //   data: {
      //     roles: ['admin']
      //   },
      //   resolve: {
      //     orderResolve: newOrder
      //   }
      // })
      .state('orders.edit', {
        url: '/:orderId/edit',
        templateUrl: '/modules/orders/client/views/admin/form-order.client.view.html',
        controller: 'OrdersController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ orderResolve.title }}'
        },
        resolve: {
          orderResolve: getOrder
        }
      })
      .state('orders.view', {
        url: '/:orderId',
        templateUrl: '/modules/orders/client/views/admin/view-order.client.view.html',
        controller: 'OrdersController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ orderResolve.title }}'
        },
        resolve: {
          orderResolve: getOrder
        }
      });
  }

  getOrder.$inject = ['$stateParams', 'OrdersService'];

  function getOrder($stateParams, OrdersService) {
    return OrdersService.get({
      orderId: $stateParams.orderId
    }).$promise;
  }

  getOrders.$inject = ['$stateParams', 'OrdersService'];

  function getOrders($stateParams, OrdersService) {
    var filterOrdersService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return OrdersService.get(filterOrdersService).$promise;
  }

  myOrders.$inject = ['$resource'];

  function myOrders($resource) {
    var historyOrders = $resource('/api/historyOrders/findAll');
    return historyOrders.query({}).$promise;
  }

  newOrder.$inject = ['OrdersService'];

  function newOrder(OrdersService) {
    return new OrdersService();
  }

  newManagerFile.$inject = ['ManagerFilesService'];

  function newManagerFile(ManagerFilesService) {
    return new ManagerFilesService();
  }
})();
