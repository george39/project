(function () {
  'use strict';

  angular.module('langs').controller('LangsController', LangsController);

  LangsController.$inject = [
    '$state',
    '$window',
    'langResolve',
    'Authentication',
    'Notification',
    '$translate',
    'managerFileResolve'
  ];

  function LangsController(
    $state,
    $window,
    lang,
    Authentication,
    Notification,
    $translate,
    managerFile
  ) {
    var vm = this;

    vm.lang = lang;
    vm.managerFile = managerFile;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.uploadFiles = uploadFiles;
    vm.removeFileById = removeFileById;

    vm.lang.files;
    vm.multiFiles = false;
    vm.valueProgress = 0;

    if (vm.lang._id) {
      vm.lang.isFileSelected = true;
      vm.lang.files = vm.multiFiles ? vm.lang.managerFile_id : null;
    }

    var optionsManagerFiles = {
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

    vm.lang.findAllManagerFiles(optionsManagerFiles, function (rst) {
      if (rst) {
        vm.listManagerFiles = rst.results;
      }
    });

    // var optionsShops = {
    //   field: ['name'],
    //   sort: {
    //     modified: 'desc'
    //   },
    //   filter: {},
    //   populate: [
    //     {
    //       path: '',
    //       select: ''
    //     }
    //   ]
    // };

    // vm.lang.findAllShops(optionsShops, function (rst) {
    //   if (rst) {
    //     vm.listShops = rst.results;
    //   }
    // });

    // Remove existing Lang
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        // vm.managerFile.removeAllFiles({ id: vm.lang.managerFile_id }, function (rstRemoveFile) {
        //   if (rstRemoveFile.error) {
        //     Notification.error({
        //       message: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('LANG.DELETED_FAIL')
        //     });
        //     return false;
        //   }
        //   vm.lang.$remove(function () {
        //     $state.go('langs.list');
        //     Notification.success({
        //       message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('LANG.DELETED_OK')
        //     });
        //   });
        // });
      }
    }

    function uploadFiles(files) {
      vm.fileSelected = true;
      vm.loading = false;
      vm.lang.isFileSelected = true;
    }

    function removeFileById(file, urlFile) {
      var files = [];

      angular.forEach(vm.lang.files, function (element) {
        if (element.$$hashKey !== file.$$hashKey) {
          files.push(element);
        }
      });

      vm.lang.files = files;
      if (vm.lang.files.length === 0) {
        vm.lang.isFileSelected = false;
      }
    }

    // Save Lang
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

      vm.managerFile
        .createOrUpdateFile({
          id: vm.lang._id ? vm.lang.managerFile_id : false,
          files: vm.lang.files,
          multiFiles: vm.multiFiles
        })
        .then(function (params) {
          vm.lang.managerFile_id = [];
          for (var index = 0; index < params.length; index++) {
            vm.lang.managerFile_id.push(params[index].data);
          }

          // Create a new lang, or update the current instance
          vm.lang.createOrUpdate().then(successCallback).catch(errorCallback);
          vm.lang.createOrUpdate().then(successCallback).catch(errorCallback);
        });

      function successCallback(res) {
        $state.go('langs.list'); // should we send the User to the list or the updated Lang's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('LANG.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('LANG.SAVED_FAIL')
        });
      }
    }
  }
})();
