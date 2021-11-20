(function () {
  'use strict';

  angular.module('notifications').controller('NotificationsController', NotificationsController);

  NotificationsController.$inject = [
    '$state',
    '$window',
    'notificationResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function NotificationsController(
    $state,
    $window,
    notification,
    Authentication,
    Notification,
    $translate
  ) {
    const vm = this;

    vm.notification = notification;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Notification
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.notification.$remove(function () {
          $state.go('notifications.list');
          Notification.success({
            message:
              '<i class="far fa-thumbs-up"></i> ' + $translate.instant('NOTIFICATION.DELETED_OK')
          });
        });
      }
    }

    // Save Notification
    function save(isValid) {
      if (!isValid) {
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new notification, or update the current instance
      vm.notification.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback() {
        $state.go('notifications.list'); // should we send the User to the list or the updated Notification's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('NOTIFICATION.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('NOTIFICATION.SAVED_FAIL')
        });
      }
    }
  }
})();
