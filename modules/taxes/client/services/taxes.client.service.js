// Taxes service used to communicate Taxes REST endpoints
(function () {
  'use strict';

  angular.module('taxes.services').factory('TaxesService', TaxesService);

  TaxesService.$inject = ['$resource', '$log'];

  function TaxesService($resource, $log) {
    var Taxes = $resource(
      '/api/taxes/:taxId',
      {
        taxId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Taxes.prototype, {
      createOrUpdate: function () {
        var tax = this;
        return createOrUpdate(tax);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/taxes/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      }
    });

    return Taxes;

    function createOrUpdate(tax) {
      if (tax._id) {
        return tax.$update(onSuccess, onError);
      } else {
        return tax.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(tax) {
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
