(function () {
  'use strict';

  angular.module('discountLists').controller('DiscountListsController', DiscountListsController);

  DiscountListsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'discountListResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function DiscountListsController(
    $scope,
    $state,
    $window,
    discountList,
    Authentication,
    Notification,
    $translate
  ) {
    var vm = this;

    vm.discountList = discountList;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Discount list
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.discountList.$remove(function () {
          $state.go('discountLists.list');
          Notification.success({
            message:
              '<i class="far fa-thumbs-up"></i> ' + $translate.instant('DISCOUNT_LIST.DELETED_OK')
          });
        });
      }
    }

    // Save Discount list
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.discountListForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new discountList, or update the current instance
      vm.discountList.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('discountLists.list'); // should we send the User to the list or the updated Discount list's view?
        Notification.success({
          message:
            '<i class="far fa-thumbs-up"></i> ' + $translate.instant('DISCOUNT_LIST.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title:
            '<i class="fas fa-trash-alt"></i> ' + $translate.instant('DISCOUNT_LIST.SAVED_FAIL')
        });
      }
    }
  }
})();
