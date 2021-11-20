(function () {
  'use strict';

  angular.module('langs').controller('LangsListController', LangsListController);

  LangsListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'langsResolve',
    'LangsService',
    'NgTableParams',
    'Notification',
    '$translate',
    'managerFileResolve'
  ];

  function LangsListController(
    $scope,
    $state,
    $window,
    langs,
    LangsService,
    NgTableParams,
    Notification,
    $translate,
    managerFile
  ) {
    // debugger;
    var vm = this;
    vm.langs = langs;
    vm.managerFile = managerFile;

    vm.remove = remove;
    vm.isEditing = false;

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

    vm.langs.findAllManagerFiles(optionsManagerFiles, function (rst) {
      if (rst.results.length > 0) {
        for (var item in rst.results) {
          if (!rst.results[item]._id) {
            continue;
          }
          vm.listManagerFiles.push({ id: rst.results[item]._id, title: rst.results[item].name });
        }
      }
    });

    // vm.listShops = [];

    // var optionsShops = {
    //   field: ['name'],
    //   sort: {
    //     modified: 'desc'
    //   },
    //   filter: {},
    //   populate: [
    //     {
    //       path: '',
    //       select: ''
    //     }
    //   ]
    // };

    // vm.langs.findAllShops(optionsShops, function (rst) {
    //   if (rst.results.length > 0) {
    //     for (var item in rst.results) {
    //       if (!rst.results[item]._id) {
    //         continue;
    //       }
    //       vm.listShops.push({ id: rst.results[item]._id, title: rst.results[item].name });
    //     }
    //   }
    // });

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'shop',
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
        return LangsService.get(params.parameters()).$promise.then(function (rstLangsService) {
          params.total(rstLangsService.total);
          return rstLangsService.results;
        });
      }
    };

    vm.tableParams = new NgTableParams(initialParams, initialSettings);

    // Remove existing Lang
    function remove(data) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.removeAllFiles({ id: data.managerFile_id }, function (rstRemoveFile) {
          if (rstRemoveFile.error) {
            Notification.warning({
              message: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('SHOP.DELETED_FAIL')
            });
            return false;
          }
          vm.langs.removeItem(data._id, function (rst) {
            if (rst.error) {
              Notification.warning({
                message:
                  '<i class="fas fa-trash-alt"></i> ' + $translate.instant('LANG.DELETED_FAIL')
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
              message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('LANG.DELETED_OK')
            });
          });
        });
      }
    }
  }
})();
