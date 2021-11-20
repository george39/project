// Groups service used to communicate Groups REST endpoints
(function () {
  'use strict';

  angular
    .module('groups.services')
    .factory('GroupsService', GroupsService);

  GroupsService.$inject = ['$resource', '$log'];

  function GroupsService($resource, $log) {
    var Groups = $resource('/api/groups/:groupId', {
      groupId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Groups.prototype, {
      createOrUpdate: function () {
        var group = this;
        return createOrUpdate(group);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/groups/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      getListModules: function () {
        var modules = $resource('/api/groups/listModules');
        return modules.get().$promise;
      }
    });

    return Groups;

    function createOrUpdate(group) {
      if (group._id) {
        return group.$update(onSuccess, onError);
      } else {
        return group.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(group) {
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
