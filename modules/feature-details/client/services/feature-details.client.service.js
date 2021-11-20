// Feature Details service used to communicate Feature Details REST endpoints
(function () {
  'use strict';

  angular.module('featureDetails.services').factory('FeatureDetailsService', FeatureDetailsService);

  FeatureDetailsService.$inject = ['$resource', '$log'];

  function FeatureDetailsService($resource, $log) {
    var FeatureDetails = $resource(
      '/api/featureDetails/:featureDetailId',
      {
        featureDetailId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(FeatureDetails.prototype, {
      createOrUpdate: function () {
        var featureDetail = this;
        return createOrUpdate(featureDetail);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/featureDetails/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllFeatures: function (params, callback) {
        var modules = $resource('/api/features/findAll', params);
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

    return FeatureDetails;

    function createOrUpdate(featureDetail) {
      if (featureDetail._id) {
        return featureDetail.$update(onSuccess, onError);
      } else {
        return featureDetail.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(featureDetail) {
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
