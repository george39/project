(function () {
  'use strict';

  angular.module('products').controller('ProductsController', ProductsController);

  ProductsController.$inject = [
    '$state',
    '$window',
    'Authentication',
    'Notification',
    'productResolve',
    'managerFileResolve',
    '$translate'
  ];

  function ProductsController(
    $state,
    $window,
    Authentication,
    Notification,
    product,
    managerFile,
    $translate
  ) {
    const vm = this;
    vm.isLoading = false;
    product.tax_id = product.tax_id ? product.tax_id._id : null;
    vm.product = product;
    vm.product.typeDiscount = vm.product.typeDiscount ? vm.product.typeDiscount._id : null;
    vm.form = {};
    Authentication.product = vm.product;
    Authentication.form = vm.form;

    vm.managerFile = managerFile;
    vm.product.tab = 'basic';
    vm.remove = remove;
    vm.save = save;
    vm.changeTab = changeTab;

    function changeTab(tab) {
      // if (vm.product.tab !== tab) {
      //   Notification.success({
      //     message: 'Debe guardar primero'
      //   });
      // }
      vm.product.tab = tab;
      $state.go('products.edit.' + String(tab));
    }

    // Remove existing Product
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.removeAllFiles(
          {
            id: vm.product.managerFile_id
          },
          function (rstRemoveFile) {
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
          }
        );
      }
    }

    // Save Product
    function save(type) {
      vm.isLoading = true;
      var formActiveIs = '';
      var isValid = false;
      angular.forEach(Authentication.form, function (i) {
        if (i) {
          formActiveIs = i.$name;
          isValid = i.$valid;
        }
      });

      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.productForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      if (formActiveIs === 'vm.form.basicForm') {
        vm.managerFile
          .createOrUpdateFile({
            id: vm.product._id ? vm.product.managerFile_id : false,
            files: vm.product.files,
            multiFiles: vm.product.multiFiles
          })
          .then(function (params) {
            vm.product.managerFile_id = [];
            for (var index = 0; index < params.length; index++) {
              vm.product.managerFile_id.push(params[index].data);
            }
            // Create a new product, or update the current instance
            vm.product.createOrUpdate().then(successCallback).catch(errorCallback);
          });
      } else {
        // Create a new product, or update the current instance
        vm.product.createOrUpdate().then(successCallback).catch(errorCallback);
      }

      function successCallback(res) {
        vm.isLoading = true;
        if (type === 'continue') {
          $state.go('products.edit.basic', { productId: res._id });
        } else {
          $state.go('products.list');
        }

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

    $(document).ready(() => {
      $('.select-multiple').select2();
    });
  }
})();
