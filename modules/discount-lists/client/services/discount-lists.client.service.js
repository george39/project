// Discount Lists service used to communicate Discount Lists REST endpoints
(function () {
  'use strict';

  angular.module('discountLists.services').factory('DiscountListsService', DiscountListsService);

  DiscountListsService.$inject = ['$resource', '$log'];

  function DiscountListsService($resource, $log) {
    var DiscountLists = $resource(
      '/api/discountLists/:discountListId',
      {
        discountListId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(DiscountLists.prototype, {
      createOrUpdate: function () {
        var discountList = this;
        return createOrUpdate(discountList);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/discountLists/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      }
    });

    return DiscountLists;

    function createOrUpdate(discountList) {
      if (discountList._id) {
        return discountList.$update(onSuccess, onError);
      } else {
        return discountList.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(discountList) {
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
