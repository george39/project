(function () {
  'use strict';

  angular.module('products').controller('ProductsBasicController', ProductsBasicController);

  ProductsBasicController.$inject = ['Authentication', 'managerFileResolve'];

  function ProductsBasicController(Authentication, managerFile) {
    const vm = this;
    vm.form = Authentication.form;
    vm.product = Authentication.product;
    vm.managerFile = managerFile;

    vm.uploadFiles = uploadFiles;
    vm.removeFileById = removeFileById;

    vm.listCategories = [];
    vm.listLangs = [];

    vm.product.files;
    vm.product.multiFiles = true;
    vm.valueProgress = 0;

    if (!vm.product._id) {
      // Product Langs
      vm.product.productLang = [];
    } else {
      // Manager Files
      vm.product.isFileSelected = true;
      vm.product.files = vm.product.multiFiles ? vm.product.managerFile_id : null;
    }

    const optionsCategories = {
      sort: {
        modified: 'desc'
      },
      filter: {
        'categoryLang.name': {
          $not: { $regex: 'manualidades', $options: 'i' }
        },
        'ancestors.categoryLang.name': {
          $not: { $regex: 'manualidades', $options: 'i' }
        }
      }
    };

    vm.product.findAllCategories(optionsCategories, function (rst) {
      if (rst.length > 0) {
        for (const item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listCategories.push({ _id: rst[item]._id, name: rst[item].categoryLang[0].name });
        }
      }
    });

    const optionsLangs = {
      sort: {
        modified: 'desc'
      }
    };

    vm.product.findAllLangs(optionsLangs, function (rst) {
      if (rst.results.length > 0) {
        for (const item in rst.results) {
          if (!rst.results[item]._id) {
            continue;
          }
          vm.listLangs.push({ _id: rst.results[item]._id, name: rst.results[item].name });
        }
      }
    });

    const optionsManagerFiles = {
      field: ['name'],
      sort: {
        modified: 'desc'
      }
    };

    vm.product.findAllManagerFiles(optionsManagerFiles, function (rst) {
      if (rst) {
        vm.listManagerFiles = rst.results;
      }
    });

    function uploadFiles() {
      vm.fileSelected = true;
      vm.loading = false;
      vm.product.isFileSelected = true;
    }

    function removeFileById(file, urlFile) {
      var files = [];
      angular.forEach(vm.product.files, function (element) {
        if (element.$$hashKey !== file.$$hashKey) {
          files.push(element);
        }
      });

      vm.product.files = files;
      if (vm.product.files.length === 0) {
        vm.product.isFileSelected = false;
      }
    }
  }
})();
