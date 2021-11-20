(function () {
  'use strict';

  angular.module('movements.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('movements', {
        abstract: true,
        url: '/movements',
        template: '<ui-view/>'
      })
      .state('movements.list', {
        url: '',
        templateUrl: '/modules/movements/client/views/admin/list-movements.client.view.html',
        controller: 'MovementsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          movementsResolve: getMovements
        }
      })
      .state('movements.create', {
        url: '/create',
        templateUrl: '/modules/movements/client/views/admin/form-movement.client.view.html',
        controller: 'MovementsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          movementResolve: newMovement
        }
      })
      .state('movements.edit', {
        url: '/:movementId/edit',
        templateUrl: '/modules/movements/client/views/admin/form-movement.client.view.html',
        controller: 'MovementsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ movementResolve.title }}'
        },
        resolve: {
          movementResolve: getMovement
        }
      })
      .state('movements.view', {
        url: '/:movementId',
        templateUrl: '/modules/movements/client/views/admin/view-movement.client.view.html',
        controller: 'MovementsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ movementResolve.title }}'
        },
        resolve: {
          movementResolve: getMovement
        }
      });
  }

  getMovement.$inject = ['$stateParams', 'MovementsService'];

  function getMovement($stateParams, MovementsService) {
    return MovementsService.get({
      movementId: $stateParams.movementId
    }).$promise;
  }

  getMovementDetail.$inject = ['$stateParams', 'MovementsService'];

  function getMovementDetail($stateParams, MovementsService) {
    return MovementsService.findMovementDetail({
      movementId: $stateParams.movementId
    }).then(function (params) {
      return params;
    });
  }

  getMovements.$inject = ['$stateParams', 'MovementsService'];

  function getMovements($stateParams, MovementsService) {
    var filterMovementsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return MovementsService.get(filterMovementsService).$promise;
  }

  newMovement.$inject = ['MovementsService'];

  function newMovement(MovementsService) {
    return new MovementsService();
  }
})();
