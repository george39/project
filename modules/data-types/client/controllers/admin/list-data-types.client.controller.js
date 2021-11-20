(function () {
  'use strict';

  angular.module('dataTypes').controller('DataTypesListController', DataTypesListController);

  DataTypesListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'dataTypesResolve',
    'DataTypesService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function DataTypesListController(
    $scope,
    $state,
    $window,
    dataTypes,
    DataTypesService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.dataTypes = dataTypes;

    vm.listStatus = getStatus;
    vm.remove = remove;

    vm.isEditing = false;

    vm.listAliases = [];
    // vm.listShops = [];

    var optionsAliases = {
      field: ['name'],
      sort: {
        'alias_id.nameLang': 'desc',
        order: 'desc'
      },
      filter: {},
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    vm.dataTypes.findAllAliases(optionsAliases, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listAliases.push({
            id: rst[item]._id,
            title: rst[item].name
          });
        }
      }
    });

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

    // vm.dataTypes.findAllShops(optionsShops, function (rst) {
    //   if (rst.length > 0) {
    //     for (var item in rst) {
    //       if (!rst[item]._id) {
    //         continue;
    //       }
    //       vm.listShops.push({
    //         id: rst[item]._id,
    //         title: rst[item].name
    //       });
    //     }
    //   }
    // });

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'alias_id',
          select: 'nameLang'
        },
        {
          path: 'shop',
          select: 'name'
        }
      ]
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return DataTypesService.get(params.parameters()).$promise.then(function (
          rstDataTypesService
        ) {
          params.total(rstDataTypesService.total);
          return rstDataTypesService.results;
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

    // Remove existing Data Type
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.dataTypes.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('DATA_TYPE.DELETED_FAIL')
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
              '<i class="far fa-thumbs-up"></i> ' + $translate.instant('DATA_TYPE.DELETED_OK')
          });
        });
      }
    }
  }
})();
