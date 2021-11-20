// Discount Massives service used to communicate Discount Massives REST endpoints
(function () {
  'use strict';

  angular.module('discountMassives.services').factory('DiscountMassivesService', DiscountMassivesService);

  DiscountMassivesService.$inject = ['$resource', '$log'];

  function DiscountMassivesService($resource, $log) {
    var DiscountMassives = $resource(
      '/api/discountMassives/:discountMassiveId',
      {
        discountMassiveId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(DiscountMassives.prototype, {
      createOrUpdate: function () {
        var discountMassive = this;
        return createOrUpdate(discountMassive);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/discountMassives/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllProducts: function (params, callback) {
        var modules = $resource('/api/products/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      }
    });

    return DiscountMassives;

    function createOrUpdate(discountMassive) {
      if (discountMassive._id) {
        return discountMassive.$update(onSuccess, onError);
      } else {
        return discountMassive.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(discountMassive) {
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
