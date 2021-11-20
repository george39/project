// Orders service used to communicate Orders REST endpoints
(function () {
  'use strict';

  angular.module('orders.services').factory('OrdersService', OrdersService);

  OrdersService.$inject = ['$resource', '$log'];

  function OrdersService($resource, $log) {
    var Orders = $resource(
      '/api/orders/:orderId',
      {
        orderId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Orders.prototype, {
      createOrUpdate: function () {
        var order = this;
        return createOrUpdate(order);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/orders/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      getOrder: function (id, params, callback) {
        var modules = $resource('/api/orders/' + id, params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      },
      findAllProductos: function (params, callback) {
        var modules = $resource('/api/products/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllShippers: function (params, callback) {
        var modules = $resource('/api/shippers/findAll', params);
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
      findAllUsers: function (params, callback) {
        var modules = $resource('/api/users', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      }
    });

    return Orders;

    function createOrUpdate(order) {
      if (order._id) {
        return order.$update(onSuccess, onError);
      } else {
        return order.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(order) {
        // Any required internal processing from inside the service, goes here.
        return true;
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
        return false;
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
})();
