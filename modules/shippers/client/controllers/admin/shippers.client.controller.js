(function () {
  'use strict';

  angular.module('shippers').controller('ShippersController', ShippersController);

  ShippersController.$inject = [
    '$state',
    '$window',
    'shipperResolve',
    'Authentication',
    'Notification',
    '$translate',
    'managerFileResolve'
  ];

  function ShippersController(
    $state,
    $window,
    shipper,
    Authentication,
    Notification,
    $translate,
    managerFile
  ) {
    var vm = this;

    vm.shipper = shipper;
    vm.managerFile = managerFile;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.uploadFiles = uploadFiles;
    vm.removeFileById = removeFileById;

    vm.shipper.files;
    vm.multiFiles = false;
    vm.valueProgress = 0;

    if (vm.shipper._id) {
      vm.shipper.isFileSelected = true;
      vm.shipper.files = vm.multiFiles ? vm.shipper.managerFile_id : null;
    }

    vm.listThirds = [];

    var optionsThirds = {
      sort: {
        modified: 'desc'
      },
      filter: { 'typeThird_id.nameLang': 'Transportista' }
    };

    vm.shipper.findAllThirdByType(optionsThirds, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listThirds.push({ _id: rst[item]._id, name: rst[item].name });
        }
      }
    });

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

    vm.shipper.findAllManagerFiles(optionsManagerFiles, function (rst) {
      if (rst) {
        vm.listManagerFiles = rst.results;
      }
    });

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

    vm.shipper.findAllShops(optionsShops, function (rst) {
      if (rst) {
        vm.listShops = rst.results;
      }
    });

    // Remove existing Shipper
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.removeAllFiles({ id: vm.shipper.managerFile_id }, function (rstRemoveFile) {
          if (rstRemoveFile.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('CATEGORY.DELETED_FAIL')
            });
            return false;
          }
          vm.shipper.$remove(function () {
            $state.go('shippers.list');
            Notification.success({
              message:
                '<i class="far fa-thumbs-up"></i> ' + $translate.instant('SHIPPER.DELETED_OK')
            });
          });
        });
      }
    }

    function beginUpdate() {
      vm.loading = true;

      vm.value = Math.floor(Math.random() * 100 + 1);
      if (vm.value < 25) {
        vm.type = 'success';
      } else if (vm.value < 50) {
        vm.type = 'info';
      } else if (vm.value < 75) {
        vm.type = 'warning';
      } else {
        vm.type = 'danger';
      }
      vm.showWarning = vm.type === 'danger' || vm.type === 'warning';
    }

    function uploadFiles(files) {
      vm.fileSelected = true;
      vm.loading = false;
      vm.shipper.isFileSelected = true;
    }

    function removeFileById(file, urlFile) {
      var files = [];
      angular.forEach(vm.shipper.files, function (element) {
        if (element.$$hashKey !== file.$$hashKey) {
          files.push(element);
        }
      });

      vm.shipper.files = files;
      if (vm.shipper.files.length === 0) {
        vm.shipper.isFileSelected = false;
      }
    }

    // Save Shipper
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.shipperForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      vm.managerFile
        .createOrUpdateFile({
          id: vm.shipper._id ? vm.shipper.managerFile_id : false,
          files: vm.shipper.files,
          multiFiles: vm.multiFiles
        })
        .then(function (params) {
          vm.shipper.managerFile_id = [];
          for (var index = 0; index < params.length; index++) {
            vm.shipper.managerFile_id.push(params[index].data);
          }

          // Create a new shipper, or update the current instance
          vm.shipper.createOrUpdate().then(successCallback).catch(errorCallback);
        });

      function successCallback(res) {
        $state.go('shippers.list'); // should we send the User to the list or the updated Shipper's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('SHIPPER.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('SHIPPER.SAVED_FAIL')
        });
      }
    }
  }
})();
