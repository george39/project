(function () {
  'use strict';

  angular.module('aliases').controller('AliasesController', AliasesController);

  AliasesController.$inject = [
    '$scope',
    '$state',
    '$window',
    'aliasResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function AliasesController(
    $scope,
    $state,
    $window,
    alias,
    Authentication,
    Notification,
    $translate
  ) {
    var vm = this;

    vm.alias = alias;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Alias
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.alias.$remove(function () {
          $state.go('aliases.list');
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('ALIAS.DELETED_OK')
          });
        });
      }
    }

    // Save Alias
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.aliasForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new alias, or update the current instance
      vm.alias.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('aliases.list'); // should we send the User to the list or the updated Alias's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('ALIAS.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('ALIAS.SAVED_FAIL')
        });
      }
    }
  }
})();
