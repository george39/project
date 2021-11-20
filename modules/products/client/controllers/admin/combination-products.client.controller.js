(function () {
  'use strict';

  angular
    .module('products')
    .controller('CombinationPictureController', CombinationPictureController);

  CombinationPictureController.$inject = [
    'Authentication',
    'Notification',
    '$stateParams',
    '$state',
    'managerFileResolve',
    '$resource',
    '$translate'
  ];

  function CombinationPictureController(
    Authentication,
    Notification,
    $stateParams,
    $state,
    managerFileResolve,
    $resource,
    $translate
  ) {
    var vm = this;
    vm.form = Authentication.form;
    vm.index = $stateParams.index;
    vm.loading = false;
    vm.files = [];
    vm.filesRow = [];

    if (!Authentication.product.movements) {
      $state.go('products.edit.quantity');
      return false;
    }

    if (Authentication.product.movements[vm.index].data.managerFile_id) {
      var cont = 0;
      angular.forEach(Authentication.product.movements[vm.index].data.managerFile_id, function (
        file
      ) {
        vm.filesRow[cont] = {
          image: file
        };
        cont++;
      });
    }

    vm.upload = function (files) {
      if (vm.filesRow.length <= 8) {
        var reader = new FileReader();
        reader.onload = function () {
          vm.filesRow[vm.filesRow.length] = {
            image: reader.result,
            parentIndex: vm.files.length - 1
          };
        };
        reader.readAsDataURL(files[files.length - 1]);
      }
    };

    vm.removeImage = function (index) {
      if (!vm.filesRow[index].image._id) {
        vm.files.splice(vm.filesRow[index].parentIndex, 1);
        vm.filesRow.splice(index, 1);
      } else {
        managerFileResolve.removeItem(vm.filesRow[index].image._id, function (rst) {
          if (rst) {
            var newManagerFile = Authentication.product.movements[
              vm.index
            ].data.managerFile_id.filter(function (file) {
              return file._id !== vm.filesRow[index].image._id;
            });
            Authentication.product.movements[vm.index].data.managerFile_id = newManagerFile;
            vm.filesRow.splice(index, 1);
          }
        });
      }
    };

    vm.save = function () {
      managerFileResolve
        .createOrUpdateFile({
          id: Authentication.product._id ? vm.files : false,
          files: vm.files,
          multiFiles: true
        })
        .then(function (params) {
          if (!Authentication.product.movements[vm.index].data.managerFile_id) {
            Authentication.product.movements[vm.index].data.managerFile_id = [];
          }

          for (var index = 0; index < params.length; index++) {
            Authentication.product.movements[vm.index].data.managerFile_id.push(
              params[index].data._id
            );
          }

          var movement = $resource('/api/movements', {
            picture: 1
          });

          var obj = {
            product_id: Authentication.product._id,
            data: Authentication.product.movements[vm.index].data,
            sons: Authentication.product.movements[vm.index].sons
          };

          movement.save(obj, function (res) {
            if (res) {
              Notification.success({
                message: '<i class="far fa-thumbs-up"></i> ' + 'Imagenes Actualizadas'
              });

              vm.files = [];
            }
          });
        });
    };
  }
})();
