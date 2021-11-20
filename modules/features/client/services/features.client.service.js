// Features service used to communicate Features REST endpoints
(function () {
  'use strict';

  angular.module('features.services').factory('FeaturesService', FeaturesService);

  FeaturesService.$inject = ['$resource', '$log'];

  function FeaturesService($resource, $log) {
    var Features = $resource(
      '/api/features/:featureId',
      {
        featureId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Features.prototype, {
      createOrUpdate: function () {
        var feature = this;
        return createOrUpdate(feature);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/features/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllTypeFeatures: function (params, callback) {
        var modules = $resource('/api/dataTypes/findAll', params);
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

    return Features;

    function createOrUpdate(feature) {
      if (feature._id) {
        return feature.$update(onSuccess, onError);
      } else {
        return feature.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(feature) {
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
