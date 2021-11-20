(function () {
  'use strict';

  angular.module('langs').controller('ManagerTranslatesController', ManagerTranslatesController);

  ManagerTranslatesController.$inject = [
    '$scope',
    '$state',
    '$window',
    'langResolve',
    'fileLangResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function ManagerTranslatesController(
    $scope,
    $state,
    $window,
    lang,
    fileLang,
    Authentication,
    Notification,
    $translate
  ) {
    var vm = this;

    vm.lang = lang;
    vm.lang.dataFileLang = fileLang.results;
    vm.authentication = Authentication;
    vm.form = {};

    vm.newField = newField;
    vm.remove = remove;
    vm.save = save;
    vm.showInputs;
    vm.isEditing;

    // Remove existing Manager translate
    function newField(keyMain, valueMain) {
      console.log('keyMain');
      console.log(keyMain);
      console.log('keyMain');

      console.log('valueMain');
      console.log(valueMain);
      console.log('valueMain');

      console.log('vm.keyObject');
      console.log(vm.keyObject);
      console.log('vm.keyObject');

      console.log('vm.valueObject');
      console.log(vm.valueObject);
      console.log('vm.valueObject');

      console.log('vm.isEditing');
      console.log(vm.isEditing);
      console.log('vm.isEditing');
    }

    // Remove existing Manager translate
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.lang.$remove(function () {
          $state.go('langs.list');
          Notification.success({
            message:
              '<i class="far fa-thumbs-up"></i> ' +
              $translate.instant('MANAGER_TRANSLATE.DELETED_OK')
          });
        });
      }
    }

    // Save Manager translate
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.langForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // // Create a new lang, or update the current instance
      vm.lang.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('langs.list'); // should we send the User to the list or the updated Manager translate's view?
        Notification.success({
          message:
            '<i class="far fa-thumbs-up"></i> ' + $translate.instant('MANAGER_TRANSLATE.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title:
            '<i class="fas fa-trash-alt"></i> ' + $translate.instant('MANAGER_TRANSLATE.SAVED_FAIL')
        });
      }
    }
  }
})();
