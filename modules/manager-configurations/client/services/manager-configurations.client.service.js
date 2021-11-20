// Manager Configurations service used to communicate Manager Configurations REST endpoints
(function () {
  'use strict';

  angular.module('managerConfigurations.services').factory('ManagerConfigurationsService', ManagerConfigurationsService);

  ManagerConfigurationsService.$inject = ['$resource', '$log'];

  function ManagerConfigurationsService($resource, $log) {
    var ManagerConfigurations = $resource(
      '/api/managerConfigurations/:managerConfigurationId',
      {
        managerConfigurationId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(ManagerConfigurations.prototype, {
      createOrUpdate: function () {
        var managerConfiguration = this;
        return createOrUpdate(managerConfiguration);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/managerConfigurations/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      }
    });

    return ManagerConfigurations;

    function createOrUpdate(managerConfiguration) {
      if (managerConfiguration._id) {
        return managerConfiguration.$update(onSuccess, onError);
      } else {
        return managerConfiguration.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(managerConfiguration) {
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
