(function () {
  'use strict';

  angular.module('thirds').controller('ThirdsListController', ThirdsListController);

  ThirdsListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'thirdsResolve',
    'ThirdsService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function ThirdsListController(
    $scope,
    $state,
    $window,
    thirds,
    ThirdsService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.thirds = thirds;

    vm.remove = remove;
    vm.listStatus = getStatus;
    vm.isEditing = false;

    vm.listTypeThirds = [];

    var optionsTypeThirds = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeThird' }
    };

    vm.thirds.findAllDataTypesByAlias(optionsTypeThirds, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listTypeThirds.push({ id: rst[item]._id, title: rst[item].nameLang });
        }
      }
    });

    vm.listTypeDocuments = [];

    var optionsTypeDocuments = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeDocument' }
    };

    vm.thirds.findAllDataTypesByAlias(optionsTypeDocuments, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listTypeDocuments.push({ id: rst[item]._id, title: rst[item].nameLang });
        }
      }
    });

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'typeThird_id typeDocument_id ',
          select: 'nameLang nameLang'
        }
      ]
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return ThirdsService.get(params.parameters()).$promise.then(function (rstThirdsService) {
          params.total(rstThirdsService.total);
          return rstThirdsService.results;
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

    // Remove existing Third
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.thirds.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('THIRD.DELETED_FAIL')
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
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('THIRD.DELETED_OK')
          });
        });
      }
    }
  }
})();
