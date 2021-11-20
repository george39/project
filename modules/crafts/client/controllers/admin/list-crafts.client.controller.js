(function () {
  'use strict';

  angular.module('crafts').controller('CraftsListController', CraftsListController);

  CraftsListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'craftsResolve',
    'CraftsService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function CraftsListController(
    $scope,
    $state,
    $window,
    crafts,
    CraftsService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.crafts = crafts;

    vm.remove = remove;
    vm.isEditing = false;

    vm.listProducts = [];

    var optionsProducts = {
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

    vm.crafts.findAllProducts(optionsProducts, function (rst) {
      if (rst.results.length > 0) {
        for (var item in rst.results) {
          if (!rst.results[item]._id) {
            continue;
          }
          vm.listProducts.push({ id: rst.results[item]._id, title: rst.results[item].name });
        }
      }
    });

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'materials',
          select: 'name'
        }
      ]
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return CraftsService.get(params.parameters()).$promise.then(function (rstCraftsService) {
          params.total(rstCraftsService.total);
          return rstCraftsService.results;
        });
      }
    };

    vm.tableParams = new NgTableParams(initialParams, initialSettings);

    // Remove existing Craft
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.crafts.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('CRAFT.DELETED_FAIL')
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
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('CRAFT.DELETED_OK')
          });
        });
      }
    }
  }
})();
