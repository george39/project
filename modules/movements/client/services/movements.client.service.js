// Movements service used to communicate Movements REST endpoints
(function () {
  'use strict';

  angular.module('movements.services').factory('MovementsService', MovementsService);

  MovementsService.$inject = ['$resource', '$log'];

  function MovementsService($resource, $log) {
    var Movements = $resource(
      '/api/movements/:movementId',
      {
        movementId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Movements.prototype, {
      createOrUpdate: function () {
        var movement = this;
        return createOrUpdate(movement);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/movements/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllProducts: function (params, callback) {
        var modules = $resource('/api/products/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllFeatureDetails: function (params, callback) {
        var modules = $resource('/api/featureDetails/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllTypeMovements: function (params, callback) {
        var modules = $resource('/api/dataTypes/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllOrders: function (params, callback) {
        var modules = $resource('/api/orders/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllShops: function (params, callback) {
        var modules = $resource('/api/shops/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllCombinationByProduct: function (params, callback) {
        var modules = $resource('/api/movements/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllMovements: function (params, callback) {
        var modules = $resource('/api/movements/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findMovementDetail: function (params, callback) {
        var modules = $resource('/api/movements/findDetail', params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      }
    });

    return Movements;

    function createOrUpdate(movement) {
      if (movement._id) {
        return movement.$update(onSuccess, onError);
      } else {
        return movement.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(movement) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
})();
