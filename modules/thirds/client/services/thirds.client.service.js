// Thirds service used to communicate Thirds REST endpoints
(function () {
  'use strict';

  angular.module('thirds.services').factory('ThirdsService', ThirdsService);

  ThirdsService.$inject = ['$resource', '$log'];

  function ThirdsService($resource, $log) {
    var Thirds = $resource(
      '/api/thirds/:thirdId',
      {
        thirdId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Thirds.prototype, {
      createOrUpdate: function () {
        var third = this;
        return createOrUpdate(third);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/thirds/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllDataTypesByAlias: function (params, callback) {
        var modules = $resource('/api/dataTypes/findAll', params);
        modules.query({}, function (rst) {
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

    return Thirds;

    function createOrUpdate(third) {
      if (third._id) {
        return third.$update(onSuccess, onError);
      } else {
        return third.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(third) {
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
