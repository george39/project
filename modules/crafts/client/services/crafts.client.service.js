// Crafts service used to communicate Crafts REST endpoints
(function () {
  'use strict';

  angular.module('crafts.services').factory('CraftsService', CraftsService);

  CraftsService.$inject = ['$resource', '$log'];

  function CraftsService($resource, $log) {
    var Crafts = $resource(
      '/api/crafts/:craftId',
      {
        craftId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Crafts.prototype, {
      createOrUpdate: function () {
        var craft = this;
        return createOrUpdate(craft);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/crafts/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllProducts: function (params, callback) {
        var modules=$resource('/api/products', params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      }
    });

    return Crafts;

    function createOrUpdate(craft) {
      if (craft._id) {
        return craft.$update(onSuccess, onError);
      } else {
        return craft.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(craft) {
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
