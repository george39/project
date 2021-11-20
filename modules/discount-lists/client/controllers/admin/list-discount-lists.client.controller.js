(function () {
  'use strict';

  angular
    .module('discountLists')
    .controller('DiscountListsListController', DiscountListsListController);

  DiscountListsListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'discountListsResolve',
    'DiscountListsService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function DiscountListsListController(
    $scope,
    $state,
    $window,
    discountLists,
    DiscountListsService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.discountLists = discountLists;

    vm.remove = remove;
    vm.isEditing = false;
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
        return DiscountListsService.get(params.parameters()).$promise.then(function (
          rstDiscountListsService
        ) {
          params.total(rstDiscountListsService.total);
          return rstDiscountListsService.results;
        });
      }
    };

    vm.tableParams = new NgTableParams(initialParams, initialSettings);

    // Remove existing Discount List
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.discountLists.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' +
                $translate.instant('DISCOUNT_LIST.DELETED_FAIL')
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
              '<i class="far fa-thumbs-up"></i> ' + $translate.instant('DISCOUNT_LIST.DELETED_OK')
          });
        });
      }
    }
  }
})();
