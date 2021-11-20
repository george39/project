// Aliases service used to communicate Aliases REST endpoints
(function () {
  'use strict';

  angular.module('aliases.services').factory('AliasesService', AliasesService);

  AliasesService.$inject = ['$resource', '$log'];

  function AliasesService($resource, $log) {
    var Aliases = $resource(
      '/api/aliases/:aliasId',
      {
        aliasId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Aliases.prototype, {
      createOrUpdate: function () {
        var alias = this;
        return createOrUpdate(alias);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/aliases/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      }
    });

    return Aliases;

    function createOrUpdate(alias) {
      if (alias._id) {
        return alias.$update(onSuccess, onError);
      } else {
        return alias.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(alias) {
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
