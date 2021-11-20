// Shippers service used to communicate Shippers REST endpoints
(function () {
  'use strict';

  angular.module('shippers.services').factory('ShippersService', ShippersService);

  ShippersService.$inject = ['$resource', '$log'];

  function ShippersService($resource, $log) {
    var Shippers = $resource(
      '/api/shippers/:shipperId',
      {
        shipperId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Shippers.prototype, {
      createOrUpdate: function () {
        var shipper = this;
        return createOrUpdate(shipper);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/shippers/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllThirdByType: function (params, callback) {
        var modules = $resource('/api/thirds/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllManagerFiles: function (params, callback) {
        var modules = $resource('/api/managerFiles', params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      },
      findAllShops: function (params, callback) {
        var modules = $resource('/api/shops', params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      }
    });

    return Shippers;

    function createOrUpdate(shipper) {
      if (shipper._id) {
        return shipper.$update(onSuccess, onError);
      } else {
        return shipper.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(shipper) {
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
