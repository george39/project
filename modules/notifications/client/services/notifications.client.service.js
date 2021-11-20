// Notifications service used to communicate Notifications REST endpoints
(function () {
  'use strict';

  angular.module('notifications.services').factory('NotificationsService', NotificationsService);

  NotificationsService.$inject = ['$resource', '$log'];

  function NotificationsService($resource, $log) {
    var Notifications = $resource(
      '/api/notifications/:notificationId',
      {
        notificationId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Notifications.prototype, {
      createOrUpdate: function () {
        var notification = this;
        return createOrUpdate(notification);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/notifications/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      }
    });

    return Notifications;

    function createOrUpdate(notification) {
      if (notification._id) {
        return notification.$update(onSuccess, onError);
      } else {
        return notification.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(notification) {
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
