(function () {
  'use strict';

  angular.module('shippers').controller('ShippersListController', ShippersListController);

  ShippersListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'shippersResolve',
    'ShippersService',
    'NgTableParams',
    'Notification',
    '$translate',
    'managerFileResolve'
  ];

  function ShippersListController(
    $scope,
    $state,
    $window,
    shippers,
    ShippersService,
    NgTableParams,
    Notification,
    $translate,
    managerFile
  ) {
    // debugger;
    var vm = this;
    vm.shippers = shippers;
    vm.managerFile = managerFile;

    vm.remove = remove;
    vm.listStatus = getStatus;
    vm.isEditing = false;

    vm.listThirds = [];

    var optionsThirds = {
      sort: {
        modified: 'desc'
      },
      filter: { 'typeThird_id.nameLang': 'Transportista' }
    };

    vm.shippers.findAllThirdByType(optionsThirds, function (rst) {
      if (rst.length > 0) {
        for (var item in rst.results) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listThirds.push({ id: rst[item]._id, title: rst[item].name });
        }
      }
    });

    vm.listManagerFiles = [];

    var optionsManagerFiles = {
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

    vm.shippers.findAllManagerFiles(optionsManagerFiles, function (rst) {
      if (rst.results.length > 0) {
        for (var item in rst.results) {
          if (!rst.results[item]._id) {
            continue;
          }
          vm.listManagerFiles.push({ id: rst.results[item]._id, title: rst.results[item].name });
        }
      }
    });

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

    vm.shippers.findAllShops(optionsShops, function (rst) {
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
          path: 'third_id',
          select: 'name'
        },
        {
          path: 'managerFile_id',
          select: 'originalname path'
        }
      ]
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return ShippersService.get(params.parameters()).$promise.then(function (
          rstShippersService
        ) {
          params.total(rstShippersService.total);
          return rstShippersService.results;
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

    // Remove existing Shipper
    function remove(data) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.removeAllFiles({ id: data.managerFile_id }, function (rstRemoveFile) {
          if (rstRemoveFile.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('SHIPPER.DELETED_FAIL')
            });
            return false;
          }
          vm.shippers.removeItem(data._id, function (rst) {
            if (rst.error) {
              Notification.warning({
                message:
                  '<i class="fas fa-trash-alt"></i> ' + $translate.instant('SHIPPER.DELETED_FAIL')
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
                '<i class="far fa-thumbs-up"></i> ' + $translate.instant('SHIPPER.DELETED_OK')
            });
          });
        });
      }
    }
  }
})();
