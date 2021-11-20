(function () {
  'use strict';

  angular.module('shops').controller('ShopsListController', ShopsListController);

  ShopsListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'shopsResolve',
    'ShopsService',
    'NgTableParams',
    'Notification',
    '$translate',
    'managerFileResolve'
  ];

  function ShopsListController(
    $scope,
    $state,
    $window,
    shops,
    ShopsService,
    NgTableParams,
    Notification,
    $translate,
    managerFile
  ) {
    // debugger;
    var vm = this;
    vm.shops = shops;
    vm.managerFile = managerFile;

    vm.remove = remove;
    vm.listStatus = getStatus;
    vm.isEditing = false;

    vm.listUsers = [];

    var optionsUsers = {
      field: ['displayName'],
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

    vm.shops.findAllUsers(optionsUsers, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listUsers.push({ id: rst[item]._id, title: rst[item].name });
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

    vm.shops.findAllManagerFiles(optionsManagerFiles, function (rst) {
      if (rst.results.length > 0) {
        for (var item in rst.results) {
          if (!rst.results[item]._id) {
            continue;
          }
          vm.listManagerFiles.push({ id: rst.results[item]._id, title: rst.results[item].name });
        }
      }
    });

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'user_id',
          select: 'displayName'
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
        return ShopsService.get(params.parameters()).$promise.then(function (rstShopsService) {
          params.total(rstShopsService.total);
          return rstShopsService.results;
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

    // Remove existing Shop
    function remove(dataShop) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.removeItem(dataShop.managerFile_id._id, function (rstRemoveFile) {
          if (rstRemoveFile.error) {
            Notification.warning({
              message: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('SHOP.DELETED_FAIL')
            });
            return false;
          }
          vm.shops.removeItem(dataShop._id, function (rst) {
            if (rst.error) {
              Notification.warning({
                message:
                  '<i class="fas fa-trash-alt"></i> ' + $translate.instant('SHOP.DELETED_FAIL')
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
              message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('SHOP.DELETED_OK')
            });
          });
        });
      }
    }
  }
})();
