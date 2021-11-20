(function () {
  'use strict';

  angular.module('shops').controller('ShopsController', ShopsController);

  ShopsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'shopResolve',
    'Authentication',
    'Notification',
    '$translate',
    'managerFileResolve'
  ];

  function ShopsController(
    $scope,
    $state,
    $window,
    shop,
    Authentication,
    Notification,
    $translate,
    managerFile
  ) {
    var vm = this;

    vm.shop = shop;
    vm.managerFile = managerFile;
    vm.authentication = Authentication;
    vm.form = {};

    vm.remove = remove;
    vm.save = save;

    vm.uploadFiles = uploadFiles;
    vm.removeFileById = removeFileById;
    vm.shop.files;
    vm.shop.multiFiles = true;
    vm.valueProgress = 0;

    if (vm.shop._id) {
      vm.shop.isFileSelected = true;
      vm.shop.files = vm.shop.multiFiles ? vm.shop.managerFile_id : null;
    }

    vm.listUsers = [];
    vm.progress = 0;

    var optionsUsers = {
      field: ['displayName'],
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

    vm.shop.findAllUsers(optionsUsers, function (rst) {
      if (rst) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listUsers.push({ _id: rst[item]._id, label: rst[item].displayName });
        }
      }
    });

    var optionsManagerFiles = {
      field: ['originalname path'],
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

    vm.listManagerFiles = [];
    vm.shop.findAllManagerFiles(optionsManagerFiles, function (rst) {
      if (rst) {
        vm.listManagerFiles = rst.results;
      }
    });

    function uploadFiles(files) {
      vm.fileSelected = true;
      vm.loading = false;
      vm.shop.isFileSelected = true;
    }

    function removeFileById(file, urlFile) {
      var files = [];
      angular.forEach(vm.shop.files, function (element) {
        if (element.$$hashKey !== file.$$hashKey) {
          files.push(element);
        }
      });

      vm.shop.files = files;
      if (vm.shop.files.length === 0) {
        vm.shop.isFileSelected = false;
      }
    }

    // Remove existing Shop
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.removeItem(vm.shop.managerFile_id._id, function (rstRemoveFile) {
          if (rstRemoveFile.error) {
            Notification.warning({
              message: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('SHOP.DELETED_FAIL')
            });
            return false;
          }
          vm.shop.$remove(function () {
            $state.go('shops.list');
            Notification.success({
              message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('SHOP.DELETED_OK')
            });
          });
        });
      }
    }

    // Save Shop
    function save(isValid, dataUrl) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.shopForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      vm.managerFile
        .createOrUpdateFile({
          id: vm.shop._id ? vm.shop.managerFile_id : false,
          files: vm.shop.files,
          multiFiles: vm.shop.multiFiles
        })
        .then(function (params) {
          vm.shop.managerFile_id = [];
          for (var index = 0; index < params.length; index++) {
            vm.shop.managerFile_id.push(params[index].data);
          }

          vm.shop.createOrUpdate().then(successCallback).catch(errorCallback);
        });

      function successCallback(res) {
        $state.go('shops.list'); // should we send the User to the list or the updated Shop's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('SHOP.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('SHOP.SAVED_FAIL')
        });
      }
    }
  }
})();
