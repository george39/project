(function () {
  'use strict';

  angular
    .module('managerConfigurations')
    .controller('ImagesManagerConfigurationsController', ImagesManagerConfigurationsController);

  ImagesManagerConfigurationsController.$inject = [
    '$state',
    'managerConfigurationResolve',
    'Notification',
    'ManagerFilesService',
    '$translate'
  ];

  function ImagesManagerConfigurationsController(
    $state,
    managerConfiguration,
    Notification,
    ManagerFilesService,
    $translate
  ) {
    // debugger;
    const vm = this;
    vm.isLoading = false;
    const managerFileResolve = new ManagerFilesService();
    vm.managerConfigurations = managerConfiguration;
    vm.files = vm.managerConfigurations.managerFiles;
    vm.upload = function (files) {};

    vm.removeImage = function (index) {
      if (!vm.files[index]._id) {
        vm.files.splice(index, 1);
      } else {
        var fileId = vm.files[index]._id;
        managerFileResolve.removeItem(fileId, function (rst) {
          if (rst) {
            var newManagerFile = vm.files.filter(function (file) {
              return file._id !== fileId;
            });

            vm.files = newManagerFile;
          }
        });
      }
    };

    vm.save = function () {
      vm.isLoading = true;
      const isEditing =
        vm.managerConfigurations.managerFiles.length > 0
          ? vm.managerConfigurations.managerFiles
          : false;

      managerFileResolve
        .createOrUpdateFile({
          id: isEditing,
          files: vm.files,
          multiFiles: true
        })
        .then(function (params) {
          vm.managerConfigurations.managerFiles = [];
          for (var index = 0; index < params.length; index++) {
            vm.managerConfigurations.managerFiles.push(params[index].data._id);
          }

          // Create a new managerConfiguration, or update the current instance
          vm.managerConfigurations.createOrUpdate().then(successCallback).catch(errorCallback);

          function successCallback(res) {
            vm.isLoading = false;
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
        });
    };
  }
})();
