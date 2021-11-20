(function () {
  'use strict';

  angular
    .module('notifications')
    .controller('NotificationsListController', NotificationsListController);

  NotificationsListController.$inject = [
    '$window',
    'notificationsResolve',
    'NotificationsService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function NotificationsListController(
    $window,
    notifications,
    NotificationsService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    const vm = this;
    vm.notifications = notifications;

    vm.listStatus = getStatus;
    vm.remove = remove;

    vm.isEditing = false;
    const initialParams = {
      page: 1,
      count: 10,
      populate: []
    };

    const initialSettings = {
      counts: [],
      getData: function (params) {
        return NotificationsService.get(params.parameters()).$promise.then(function (
          rstNotificationsService
        ) {
          params.total(rstNotificationsService.total);
          return rstNotificationsService.results;
        });
      }
    };

    vm.tableParams = new NgTableParams(initialParams, initialSettings);

    function getStatus(field) {
      if (field === 'status') {
        return [
          { id: 0, title: 'Inactive' },
          { id: 1, title: 'Active' }
        ];
      }
    }

    // Remove existing Notification
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.notifications.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.error({
              message:
                '<i class="fas fa-trash-alt"></i> ' +
                $translate.instant('NOTIFICATION.DELETED_FAIL')
            });
            return false;
          }
          vm.tableParams.reload().then(function (data) {
            if (data.length === 0 && vm.tableParams.total() > 0) {
              vm.tableParams.page(vm.tableParams.page() - 1);
              vm.tableParams.reload();
            }
          });
          Notification.success({
            message:
              '<i class="far fa-thumbs-up"></i> ' + $translate.instant('NOTIFICATION.DELETED_OK')
          });
        });
      }
    }
  }
})();
