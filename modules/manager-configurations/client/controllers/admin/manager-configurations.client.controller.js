(function () {
  'use strict';

  angular
    .module('managerConfigurations')
    .controller('ManagerConfigurationsController', ManagerConfigurationsController);

  ManagerConfigurationsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'managerConfigurationResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function ManagerConfigurationsController(
    $scope,
    $state,
    $window,
    managerConfiguration,
    Authentication,
    Notification,
    $translate
  ) {
    var vm = this;

    vm.managerConfiguration = managerConfiguration;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Manager configuration
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerConfiguration.$remove(function () {
          $state.go('managerConfigurations.list');
          Notification.success({
            message:
              '<i class="far fa-thumbs-up"></i> ' +
              $translate.instant('MANAGER_CONFIGURATION.DELETED_OK')
          });
        });
      }
    }

    // Save Manager configuration
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.managerConfigurationForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new managerConfiguration, or update the current instance
      vm.managerConfiguration.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('managerConfigurations.list'); // should we send the User to the list or the updated Manager configuration's view?
        Notification.success({
          message:
            '<i class="far fa-thumbs-up"></i> ' +
            $translate.instant('MANAGER_CONFIGURATION.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title:
            '<i class="fas fa-trash-alt"></i> ' +
            $translate.instant('MANAGER_CONFIGURATION.SAVED_FAIL')
        });
      }
    }
  }
})();
