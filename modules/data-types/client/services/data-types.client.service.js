// Data Types service used to communicate Data Types REST endpoints
(function () {
  'use strict';

  angular.module('dataTypes.services').factory('DataTypesService', DataTypesService);

  DataTypesService.$inject = ['$resource', '$log'];

  function DataTypesService($resource, $log) {
    var DataTypes = $resource(
      '/api/dataTypes/:dataTypeId',
      {
        dataTypeId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(DataTypes.prototype, {
      createOrUpdate: function () {
        var dataType = this;
        return createOrUpdate(dataType);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/dataTypes/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllAliases: function (params, callback) {
        var modules = $resource('/api/aliases/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllShops: function (params, callback) {
        var modules = $resource('/api/shops/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      }
    });

    return DataTypes;

    function createOrUpdate(dataType) {
      if (dataType._id) {
        return dataType.$update(onSuccess, onError);
      } else {
        return dataType.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(dataType) {
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
