// Langs service used to communicate Langs REST endpoints
(function () {
  'use strict';

  angular.module('langs.services').factory('LangsService', LangsService);

  LangsService.$inject = ['$resource', '$log'];

  function LangsService($resource, $log) {
    var Langs = $resource(
      '/api/langs/:langId',
      {
        langId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Langs.prototype, {
      createOrUpdate: function () {
        var lang = this;
        return createOrUpdate(lang);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/langs/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllManagerFiles: function (params, callback) {
        var modules = $resource('/api/managerFiles', params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      },
      findAllShops: function (params, callback) {
        var modules = $resource('/api/shops', params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      },
      getFileLang: function (params) {
        var modules = $resource('/api/langs/getFileLang', params);
        return modules.get().$promise;
      }
    });

    return Langs;

    function createOrUpdate(lang) {
      if (lang._id) {
        return lang.$update(onSuccess, onError);
      } else {
        return lang.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(lang) {
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
