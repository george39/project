(function () {
  'use strict';

  angular
    .module('discountMassives')
    .controller('DiscountMassivesListController', DiscountMassivesListController);

  DiscountMassivesListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'discountMassivesResolve',
    'DiscountMassivesService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function DiscountMassivesListController(
    $scope,
    $state,
    $window,
    discountMassives,
    DiscountMassivesService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    const vm = this;
    vm.discountMassives = discountMassives;

    vm.listStatus = getStatus;
    vm.remove = remove;

    vm.isEditing = false;

    vm.listProducts = [];

    const optionsProducts = {
      field: ['name'],
      sort: {
        modified: 'desc'
      }
    };

    vm.discountMassives.findAllProducts(optionsProducts, function (rst) {
      if (rst.length > 0) {
        for (const item in rst) {
          if (!rst[item]._id) continue;

          vm.listProducts.push({
            id: rst[item]._id,
            title: rst[item].name
          });
        }
      }
    });

    const initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'product',
          select: 'name'
        }
      ]
    };

    const initialSettings = {
      counts: [],
      getData: function (params) {
        return DiscountMassivesService.get(params.parameters()).$promise.then(function (
          rstDiscountMassivesService
        ) {
          params.total(rstDiscountMassivesService.total);
          return rstDiscountMassivesService.results;
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

    // Remove existing Discount Massive
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.discountMassives.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.error({
              message:
                '<i class="fas fa-trash-alt"></i> ' +
                $translate.instant('DISCOUNT_MASSIVE.DELETED_FAIL')
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
              $translate.instant('DISCOUNT_MASSIVE.DELETED_OK')
          });
        });
      }
    }
  }
})();
