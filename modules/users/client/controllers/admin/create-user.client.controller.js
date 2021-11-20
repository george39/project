(function () {
  'use strict';

  angular.module('users.admin').controller('CreateUserController', CreateUserController);

  CreateUserController.$inject = [
    '$resource',
    '$scope',
    '$state',
    '$stateParams',
    '$window',
    'Authentication',
    'groupsResolve',
    'Notification',
    '$translate',
    'shopsResolve',
    'ProductsService',
    'PasswordValidator'
  ];

  function CreateUserController(
    $resource,
    $scope,
    $state,
    $stateParams,
    $window,
    Authentication,
    groups,
    Notification,
    $translate,
    shops,
    ProductsService,
    PasswordValidator
  ) {
    var vm = this;

    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.user = {};
    // vm.remove = remove;
    // vm.removeAddress = removeAddress;
    vm.update = update;
    var params = {
      filter: {
        name: {
          $in: ['user', 'manager']
        }
      }
    };
    // vm.isContextUserSelf = isContextUserSelf;
    $resource('/api/groups').get(params, function (res) {
      vm.listGroups = res.results;
    });
    vm.listShops = shops.results;
    vm.dataAddress = {};
    // vm.addAddress = addAddress;
    vm.disableFormUser = false;
    vm.listDiscountLists = [];

    var optionsPriceList = {
      sort: {
        modified: 'desc'
      }
    };

    new ProductsService().findAllDiscountLists(optionsPriceList, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listDiscountLists.push({ _id: rst[item]._id, name: rst[item].name });
        }
      }
    });

    // if ($stateParams.addressId) {
    //   vm.disableFormUser = true;
    // }

    // if ($stateParams.addressId) {
    //   for (var index = 0; index < vm.user.addresses.length; index++) {
    //     if (vm.user.addresses[index]._id === $stateParams.addressId) {
    //       vm.dataAddress._id = vm.user.addresses[index]._id;
    //       vm.dataAddress.address = vm.user.addresses[index].address;
    //       vm.dataAddress.country = vm.user.addresses[index].country;
    //       vm.dataAddress.city = vm.user.addresses[index].city;
    //       vm.dataAddress.postalCode = vm.user.addresses[index].postalCode;
    //       vm.dataAddress.isDefaultAddress = vm.user.addresses[index].isDefaultAddress;
    //     }
    //   }
    // }

    // function remove(user) {
    //   if ($window.confirm('Are you sure you want to delete this user?')) {
    //     if (user) {
    //       user.$remove();

    //       vm.users.splice(vm.users.indexOf(user), 1);
    //       Notification.success('User deleted successfully!');
    //     } else {
    //       vm.user.$remove(function () {
    //         $state.go('admin.users');
    //         Notification.success({
    //           message: '<i class="far fa-thumbs-up"></i> User deleted successfully!'
    //         });
    //       });
    //     }
    //   }
    // }

    function update(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      // var user = vm.user;

      //   for (var index = 0; index < vm.user.addresses.length; index++) {
      //     if (vm.dataAddress.isDefaultAddress === true) {
      //       vm.user.addresses[index].isDefaultAddress = false;
      //     }

      //     if ($stateParams.addressId && vm.user.addresses[index]._id === $stateParams.addressId) {
      //       vm.user.addresses[index].address = vm.dataAddress.address;
      //       vm.user.addresses[index].country = vm.dataAddress.country;
      //       vm.user.addresses[index].city = vm.dataAddress.city;
      //       vm.user.addresses[index].postalCode = vm.dataAddress.postalCode;
      //       vm.user.addresses[index].isDefaultAddress = vm.dataAddress.isDefaultAddress;
      //     }
      //   }

      //   if (
      //     ($stateParams.addressId === 'addAddress' || !$stateParams.addressId) &&
      //     vm.dataAddress.address &&
      //     vm.dataAddress.country &&
      //     vm.dataAddress.city &&
      //     vm.dataAddress.postalCode
      //   ) {
      //     vm.user.addresses.push(vm.dataAddress);
      //   }

      var user = $resource('/api/users');

      var promise = user.save(vm.user).$promise;

      promise
        .then(function (res) {
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> User saved successfully!'
          });
          $state.go('admin.users');
        })
        .catch(function (err) {
          Notification.warning({
            message: err.data.message,
            title: '<i class="fas fa-trash-alt"></i> User update error!'
          });
        });

      // function addAddress() {
      //   vm.user.addresses.push(vm.dataAddress);
      //   vm.dataAddress = {};

      //   if ($stateParams.addressId) {
      //     for (var index = 0; index < vm.user.addresses.length; index++) {
      //       if (vm.user.addresses[index]._id === $stateParams.addressId) {
      //         vm.user.addresses[index].address = vm.dataAddress.address;
      //         vm.user.addresses[index].country = vm.dataAddress.country;
      //         vm.user.addresses[index].city = vm.dataAddress.city;
      //         vm.user.addresses[index].postalCode = vm.dataAddress.postalCode;
      //         vm.user.addresses[index].isDefaultAddress = vm.dataAddress.isDefaultAddress;
      //       }
      //     }
      //   }
      // }

      // Remove existing Article
      // function removeAddress(id) {
      //   if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
      //     if (id) {
      //       var newAddresses = [];
      //       for (var index = 0; index < vm.user.addresses.length; index++) {
      //         if (vm.user.addresses[index]._id !== id) {
      //           newAddresses.push(vm.user.addresses[index]);
      //         }
      //       }

      //       vm.user.addresses = newAddresses;
      //       var user = vm.user;

      //       user.$update(
      //         function () {
      //           $state.go('admin.user', {
      //             userId: user._id
      //           });
      //           Notification.success({
      //             message: '<i class="far fa-thumbs-up"></i> User saved successfully!'
      //           });
      //         },
      //         function (errorResponse) {
      //           Notification.error({
      //             message: errorResponse.data.message,
      //             title: '<i class="fas fa-trash-alt"></i> User update error!'
      //           });
      //         }
      //       );
      //     }
      //   }
    } // }
  }
})();
