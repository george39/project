(function () {
  'use strict';

  angular.module('aliases').controller('AliasesListController', AliasesListController);

  AliasesListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'aliasesResolve',
    'AliasesService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function AliasesListController(
    $scope,
    $state,
    $window,
    aliases,
    AliasesService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.aliases = aliases;

    vm.listStatus = getStatus;
    vm.remove = remove;

    vm.isEditing = false;

    var initialParams = {
      page: 1,
      count: 10,
      populate: []
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return AliasesService.get(params.parameters()).$promise.then(function (rstAliasesService) {
          params.total(rstAliasesService.total);
          return rstAliasesService.results;
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

    // Remove existing Alias
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.aliases.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('ALIAS.DELETED_FAIL')
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
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('ALIAS.DELETED_OK')
          });
        });
      }
    }
  }
})();
