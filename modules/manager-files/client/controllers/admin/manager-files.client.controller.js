(function () {
  'use strict';

  angular.module('managerFiles').controller('ManagerFilesController', ManagerFilesController);

  ManagerFilesController.$inject = [
    '$scope',
    '$state',
    '$window',
    'managerFileResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function ManagerFilesController(
    $scope,
    $state,
    $window,
    managerFile,
    Authentication,
    Notification,
    $translate
  ) {
    var vm = this;

    vm.managerFile = managerFile;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    var optionsShops = {
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

    vm.managerFile.findAllShops(optionsShops, function (rst) {
      if (rst) {
        vm.listShops = rst.results;
      }
    });

    // Remove existing Manager file
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.$remove(function () {
          $state.go('managerFiles.list');
          Notification.success({
            message:
              '<i class="far fa-thumbs-up"></i> ' + $translate.instant('MANAGER_FILE.DELETED_OK')
          });
        });
      }
    }

    // Save Manager file
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.managerFileForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new managerFile, or update the current instance
      vm.managerFile.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('managerFiles.list'); // should we send the User to the list or the updated Manager file's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('MANAGER_FILE.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('MANAGER_FILE.SAVED_FAIL')
        });
      }
    }
  }
})();
