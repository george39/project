(function () {
  'use strict';

  angular.module('taxes').controller('TaxesController', TaxesController);

  TaxesController.$inject = [
    '$scope',
    '$state',
    '$window',
    'taxResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function TaxesController($scope, $state, $window, tax, Authentication, Notification, $translate) {
    var vm = this;

    vm.tax = tax;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Tax
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.tax.$remove(function () {
          $state.go('taxes.list');
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('TAX.DELETED_OK')
          });
        });
      }
    }

    // Save Tax
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.taxForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new tax, or update the current instance
      vm.tax.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('taxes.list'); // should we send the User to the list or the updated Tax's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('TAX.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('TAX.SAVED_FAIL')
        });
      }
    }
  }
})();
