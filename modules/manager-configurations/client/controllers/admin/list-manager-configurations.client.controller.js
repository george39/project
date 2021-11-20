(function () {
  'use strict';

  angular
    .module('managerConfigurations')
    .controller('ManagerConfigurationsListController', ManagerConfigurationsListController);

  ManagerConfigurationsListController.$inject = [
    '$window',
    'managerConfigurationsResolve',
    'ManagerConfigurationsService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function ManagerConfigurationsListController(
    $window,
    managerConfigurations,
    ManagerConfigurationsService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.managerConfigurations = managerConfigurations;

    vm.remove = remove;
    vm.isEditing = false;
    vm.listStatus = getStatus;

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return ManagerConfigurationsService.get(params.parameters()).$promise.then(function (
          rstManagerConfigurationsService
        ) {
          params.total(rstManagerConfigurationsService.total);
          return rstManagerConfigurationsService.results;
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

    // Remove existing Manager Configuration
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerConfigurations.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' +
                $translate.instant('MANAGER_CONFIGURATION.DELETED_FAIL')
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
              '<i class="far fa-thumbs-up"></i> ' +
              $translate.instant('MANAGER_CONFIGURATION.DELETED_OK')
          });
        });
      }
    }
  }
})();
