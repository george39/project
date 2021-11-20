(function () {
  'use strict';

  angular.module('categories').controller('CategoriesController', CategoriesController);

  CategoriesController.$inject = [
    '$state',
    '$window',
    'categoryResolve',
    'Authentication',
    'Notification',
    '$translate',
    'managerFileResolve'
  ];

  function CategoriesController(
    $state,
    $window,
    category,
    Authentication,
    Notification,
    $translate,
    managerFile
  ) {
    var vm = this;

    vm.category = category;
    vm.managerFile = managerFile;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.uploadFiles = uploadFiles;
    vm.removeFileById = removeFileById;

    vm.category.files;
    vm.multiFiles = false;
    vm.valueProgress = 0;

    if (vm.category._id) {
      vm.category.isFileSelected = true;
      vm.category.files = vm.multiFiles ? vm.category.managerFile_id : null;
    }

    vm.listCategoriesParents = [];
    vm.listLangs = [];

    if (!vm.category._id) {
      vm.category.categoryLang = [];
    }

    var optionsCategoriesParents = {
      field: ['categoryLang'],
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

    vm.category.findAll(optionsCategoriesParents, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listCategoriesParents.push({
            _id: rst[item]._id,
            name: rst[item].categoryLang[0].name
          });
        }
      }
    });

    var optionsLangs = {
      field: [],
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

    vm.category.findAllLangs(optionsLangs, function (rst) {
      if (rst.results.length > 0) {
        for (var item in rst.results) {
          if (!rst.results[item]._id) {
            continue;
          }
          vm.listLangs.push({ _id: rst.results[item]._id, name: rst.results[item].name });
        }
      }
    });

    // Remove existing Category
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.removeAllFiles({ id: vm.category.managerFile_id }, function (rstRemoveFile) {
          if (rstRemoveFile.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('CATEGORY.DELETED_FAIL')
            });
            return false;
          }
          vm.category.$remove(function () {
            $state.go('categories.list');
            Notification.success({
              message:
                '<i class="far fa-thumbs-up"></i> ' + $translate.instant('CATEGORY.DELETED_OK')
            });
          });
        });
      }
    }

    function uploadFiles(files) {
      vm.fileSelected = true;
      vm.loading = false;
      vm.category.isFileSelected = true;
    }

    function removeFileById(file, urlFile) {
      var files = [];

      angular.forEach(vm.category.files, function (element) {
        if (element.$$hashKey !== file.$$hashKey) {
          files.push(element);
        }
      });

      vm.category.files = files;
      if (vm.category.files.length === 0) {
        vm.category.isFileSelected = false;
      }
    }

    // Save Category
    function save(isValid, dataUrl) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.categoryForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      vm.managerFile
        .createOrUpdateFile({
          id: vm.category._id ? vm.category.managerFile_id : false,
          files: vm.category.files,
          multiFiles: vm.multiFiles
        })
        .then(function (params) {
          vm.category.managerFile_id = [];
          for (var index = 0; index < params.length; index++) {
            vm.category.managerFile_id.push(params[index].data);
          }

          // Create a new category, or update the current instance
          vm.category.createOrUpdate().then(successCallback).catch(errorCallback);
        });

      function successCallback(res) {
        $state.go('categories.list'); // should we send the User to the list or the updated Category's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('CATEGORY.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('CATEGORY.SAVED_FAIL')
        });
      }
    }
  }
})();
