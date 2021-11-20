// Shops service used to communicate Shops REST endpoints
(function () {
  'use strict';

  angular.module('shops.services').factory('ShopsService', ShopsService);

  ShopsService.$inject = ['$resource', '$log'];

  function ShopsService($resource, $log) {
    var Shops = $resource(
      '/api/shops/:shopId',
      {
        shopId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Shops.prototype, {
      createOrUpdate: function () {
        var shop = this;
        return createOrUpdate(shop);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/shops/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllUsers: function (params, callback) {
        var modules = $resource('/api/users', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllManagerFiles: function (params, callback) {
        var modules = $resource('/api/managerFiles', params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      }
    });

    return Shops;

    function createOrUpdate(shop) {
      if (shop._id) {
        return shop.$update(onSuccess, onError);
      } else {
        return shop.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(shop) {
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
