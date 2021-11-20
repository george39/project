(function () {
  'use strict';

  angular.module('taxes').controller('TaxesListController', TaxesListController);

  TaxesListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'taxesResolve',
    'TaxesService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function TaxesListController(
    $scope,
    $state,
    $window,
    taxes,
    TaxesService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.taxes = taxes;

    vm.remove = remove;
    vm.listStatus = getStatus;
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
        return TaxesService.get(params.parameters()).$promise.then(function (rstTaxesService) {
          params.total(rstTaxesService.total);
          return rstTaxesService.results;
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

    // Remove existing Tax
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.taxes.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('TAX.DELETED_FAIL')
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
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('TAX.DELETED_OK')
          });
        });
      }
    }
  }
})();
