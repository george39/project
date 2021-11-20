(function () {
  'use strict';

  angular
    .module('managerFiles')
    .controller('ManagerFilesListController', ManagerFilesListController);

  ManagerFilesListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'managerFilesResolve',
    'ManagerFilesService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function ManagerFilesListController(
    $scope,
    $state,
    $window,
    managerFiles,
    ManagerFilesService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.managerFiles = managerFiles;

    vm.remove = remove;
    vm.isEditing = false;

    vm.listShops = [];

    var optionsShops = {
      field: ['name'],
      sort: {
        modified: 'desc'
      },
      filter: {},
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    vm.managerFiles.findAllShops(optionsShops, function (rst) {
      if (rst.results.length > 0) {
        for (var item in rst.results) {
          if (!rst.results[item]._id) {
            continue;
          }
          vm.listShops.push({ id: rst.results[item]._id, title: rst.results[item].name });
        }
      }
    });

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'shop',
          select: 'name'
        }
      ]
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return ManagerFilesService.get(params.parameters()).$promise.then(function (
          rstManagerFilesService
        ) {
          params.total(rstManagerFilesService.total);
          return rstManagerFilesService.results;
        });
      }
    };

    vm.tableParams = new NgTableParams(initialParams, initialSettings);

    // Remove existing Manager File
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFiles.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' +
                $translate.instant('MANAGER_FILE.DELETED_FAIL')
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
              '<i class="far fa-thumbs-up"></i> ' + $translate.instant('MANAGER_FILE.DELETED_OK')
          });
        });
      }
    }
  }
})();
