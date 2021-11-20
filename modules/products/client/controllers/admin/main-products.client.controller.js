(function () {
  'use strict';

  angular.module('products').controller('ProductsController', ProductsController);

  ProductsController.$inject = [
    '$state',
    '$window',
    'productResolve',
    'Authentication',
    'Notification',
    '$translate',
    'managerFileResolve'
  ];

  function ProductsController(
    $state,
    $window,
    product,
    Authentication,
    Notification,
    $translate,
    managerFile
  ) {
    var vm = this;

    vm.product = product;
    // vm.managerFile = managerFile;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // vm.calculateNewValue = calculateNewValue;
    // vm.uploadFiles = uploadFiles;
    // vm.removeFileById = removeFileById;

    // vm.product.files;
    // vm.multiFiles = true;
    // vm.valueProgress = 0;

    // if (vm.product._id) {
    //   vm.product.isFileSelected = true;
    //   vm.product.files = vm.multiFiles ? vm.product.managerFile_id : null;
    // }

    // vm.listCategories = [];
    // vm.listTaxes = [];
    // vm.listMakers = [];
    // vm.listProviders = [];
    // vm.listShippers = [];
    // vm.listDiscountLists = [];

    // vm.listTypeDiscount = [
    //   { id: '1', name: 'Porcentaje a Descontar' },
    //   { id: '2', name: 'Valor a Descontar' }
    // ];

    // vm.product.typeDiscount = 'listPrice';

    // if (!vm.product._id) {
    //   vm.product.productLang = [];
    // }

    // var optionsCategories = {
    //   field: ['categoryLang'],
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

    // vm.product.findAllCategories(optionsCategories, function (rst) {
    //   if (rst.length > 0) {
    //     for (var item in rst) {
    //       if (!rst[item]._id) {
    //         continue;
    //       }
    //       vm.listCategories.push({ _id: rst[item]._id, name: rst[item].categoryLang[0].name });
    //     }
    //   }
    // });

    // vm.listLangs = [];

    // var optionsLangs = {
    //   field: [],
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

    // vm.product.findAllLangs(optionsLangs, function (rst) {
    //   if (rst.results.length > 0) {
    //     for (var item in rst.results) {
    //       if (!rst.results[item]._id) {
    //         continue;
    //       }
    //       vm.listLangs.push({ _id: rst.results[item]._id, name: rst.results[item].name });
    //     }
    //   }
    // });

    // var optionsManagerFiles = {
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

    // vm.product.findAllManagerFiles(optionsManagerFiles, function (rst) {
    //   if (rst) {
    //     vm.listManagerFiles = rst.results;
    //   }
    // });

    // var optionsTaxes = {
    //   sort: {
    //     modified: 'desc'
    //   }
    // };

    // vm.product.findAllTaxes(optionsTaxes, function (rst) {
    //   if (rst.length > 0) {
    //     for (var item in rst) {
    //       if (!rst[item]._id) {
    //         continue;
    //       }
    //       vm.listTaxes.push({ _id: rst[item]._id, name: rst[item].nameLang });
    //     }
    //   }
    // });

    // var optionsMakers = {
    //   sort: {
    //     modified: 'desc'
    //   },
    //   filter: { 'typeThird_id.nameLang': 'Fabricante' }
    // };

    // vm.product.findAllThirdByType(optionsMakers, function (rst) {
    //   if (rst.length > 0) {
    //     for (var item in rst) {
    //       if (!rst[item]._id) {
    //         continue;
    //       }
    //       vm.listMakers.push({ _id: rst[item]._id, name: rst[item].name });
    //     }
    //   }
    // });

    // var optionsProviders = {
    //   sort: {
    //     modified: 'desc'
    //   },
    //   filter: { 'typeThird_id.nameLang': 'Proveedor' }
    // };

    // vm.product.findAllThirdByType(optionsProviders, function (rst) {
    //   if (rst.length > 0) {
    //     for (var item in rst) {
    //       if (!rst[item]._id) {
    //         continue;
    //       }
    //       vm.listProviders.push({ _id: rst[item]._id, name: rst[item].name });
    //     }
    //   }
    // });

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

    // vm.product.findAllShops(optionsShops, function (rst) {
    //   if (rst) {
    //     vm.listShops = rst.results;
    //   }
    // });

    // var optionsShippers = {
    //   sort: {
    //     modified: 'desc'
    //   }
    // };

    // vm.product.findAllShippers(optionsShippers, function (rst) {
    //   if (rst.length > 0) {
    //     for (var item in rst) {
    //       if (!rst[item]._id) {
    //         continue;
    //       }
    //       vm.listShippers.push({ _id: rst[item]._id, name: rst[item].third_id.name });
    //     }
    //   }
    // });

    // var optionsPriceList = {
    //   sort: {
    //     modified: 'desc'
    //   }
    // };

    // vm.product.findAllDiscountLists(optionsPriceList, function (rst) {
    //   if (rst.length > 0) {
    //     for (var item in rst) {
    //       if (!rst[item]._id) {
    //         continue;
    //       }
    //       vm.listDiscountLists.push({ _id: rst[item]._id, name: rst[item].name });
    //     }
    //   }
    // });

    // function calculateNewValue(fromInput, indexListPrice) {
    //   var valueNewPrice = 0;
    //   if (fromInput === 'discountValue') {
    //     if (vm.product.discountList_id[indexListPrice].discountType === '1') {
    //       vm.product.discountList_id[indexListPrice].discountValue =
    //         vm.product.discountList_id[indexListPrice].discountValue > 100
    //           ? 100
    //           : vm.product.discountList_id[indexListPrice].discountValue;

    //       valueNewPrice =
    //         vm.product.price - (vm.product.price * vm.product.discountList_id[indexListPrice].discountValue) / 100;
    //     } else if (vm.product.discountList_id[indexListPrice].discountType === '2') {
    //       vm.product.discountList_id[indexListPrice].discountValue =
    //         vm.product.discountList_id[indexListPrice].discountValue > vm.product.price
    //           ? vm.product.price
    //           : vm.product.discountList_id[indexListPrice].discountValue;

    //       valueNewPrice = vm.product.price - vm.product.discountList_id[indexListPrice].discountValue;
    //     }

    //     if (valueNewPrice < 0) {
    //       valueNewPrice = 0;
    //     }

    //     vm.product.discountList_id[indexListPrice].newPrice = valueNewPrice;
    //   }

    //   if (fromInput === 'price') {
    //     angular.forEach(vm.product.discountList_id, function (element, index) {
    //       valueNewPrice = 0;

    //       if (vm.product.discountList_id[index].discountType === '1') {
    //         valueNewPrice =
    //           vm.product.price - (vm.product.price * vm.product.discountList_id[index].discountValue) / 100;
    //       } else if (vm.product.discountList_id[index].discountType === '2') {
    //         valueNewPrice = vm.product.price - vm.product.discountList_id[index].discountValue;
    //       }

    //       if (valueNewPrice < 0) {
    //         valueNewPrice = 0;
    //       }

    //       vm.product.discountList_id[index].newPrice = valueNewPrice;
    //     });
    //   }
    // }

    // Remove existing Product
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.removeAllFiles({ id: vm.product.managerFile_id }, function (rstRemoveFile) {
          if (rstRemoveFile.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('PRODUCT.DELETED_FAIL')
            });
            return false;
          }
          vm.product.$remove(function () {
            $state.go('products.list');
            Notification.success({
              message:
                '<i class="far fa-thumbs-up"></i> ' + $translate.instant('PRODUCT.DELETED_OK')
            });
          });
        });
      }
    }

    // function uploadFiles(files) {
    //   vm.fileSelected = true;
    //   vm.loading = false;
    //   vm.product.isFileSelected = true;
    // }

    // function removeFileById(file, urlFile) {
    //   var files = [];
    //   angular.forEach(vm.product.files, function (element) {
    //     if (element.$$hashKey !== file.$$hashKey) {
    //       files.push(element);
    //     }
    //   });

    //   vm.product.files = files;
    //   if (vm.product.files.length === 0) {
    //     vm.product.isFileSelected = false;
    //   }
    // }

    // Save Product
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.productForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      vm.managerFile
        .createOrUpdateFile({
          id: vm.product._id ? vm.product.managerFile_id : false,
          files: vm.product.files,
          multiFiles: vm.multiFiles
        })
        .then(function (params) {
          vm.product.managerFile_id = [];
          for (var index = 0; index < params.length; index++) {
            vm.product.managerFile_id.push(params[index].data);
          }

          // Create a new product, or update the current instance
          vm.product.createOrUpdate().then(successCallback).catch(errorCallback);
        });

      function successCallback(res) {
        $state.go('products.list'); // should we send the User to the list or the updated Product's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('PRODUCT.SAVED_OK')
        });
      }
      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('PRODUCT.SAVED_FAIL')
        });
      }
    }
  }
})();
