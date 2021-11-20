(function () {
  'use strict';

  angular.module('users').controller('ManageAddressController', ManageAddressController);

  ManageAddressController.$inject = [
    '$scope',
    '$state',
    '$window',
    'UsersService',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function ManageAddressController(
    $scope,
    $state,
    $window,
    UsersService,
    Authentication,
    Notification,
    $translate
  ) {
    var vm = this;

    vm.user = Authentication.user;
    vm.updateUserProfile = updateUserProfile;
    vm.dataAddress = {};
    vm.editAddress = editAddress;
    vm.removeAddress = removeAddress;

    vm.zones = [
      { label: 'urbana (Pereira)', value: 'urbana' },
      { label: 'regional (Eje cafetero)', value: 'regional' },
      { label: 'nacional (Resto del país)', value: 'nacional' }
    ];

    // Update a user profile
    function updateUserProfile(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      var user = new UsersService(vm.user);

      for (var index = 0; index < vm.user.addresses.length; index++) {
        if (vm.dataAddress.isDefaultAddress === true) {
          vm.user.addresses[index].isDefaultAddress = false;
        }

        if (
          vm.dataAddress._id &&
          vm.user.addresses[index]._id === vm.dataAddress._id &&
          vm.dataAddress.address &&
          vm.dataAddress.country &&
          vm.dataAddress.city &&
          vm.dataAddress.zone
        ) {
          vm.user.addresses[index].address = vm.dataAddress.address;
          vm.user.addresses[index].country = vm.dataAddress.country;
          vm.user.addresses[index].city = vm.dataAddress.city;
          vm.user.addresses[index].postalCode = '';
          vm.user.addresses[index].zone = vm.dataAddress.zone;
          vm.user.addresses[index].isDefaultAddress = vm.dataAddress.isDefaultAddress;
        }
      }

      if (
        !vm.dataAddress._id &&
        vm.dataAddress.address &&
        vm.dataAddress.country &&
        vm.dataAddress.city &&
        vm.dataAddress.zone
      ) {
        vm.user.addresses.push(vm.dataAddress);
      }

      user.$update(
        function (response) {
          $scope.$broadcast('show-errors-reset', 'vm.userForm');

          Notification.success({
            message:
              '<i class="glyphicon glyphicon-ok"></i> ' +
              $translate.instant('load.User.EDIT_PROFILE_SUCCESSFUL')
          });
          Authentication.user = response;
          vm.dataAddress = {};
        },
        function (response) {
          Notification.warning({
            message: response.data.message,
            title:
              '<i class="glyphicon glyphicon-remove"></i> ' +
              $translate.instant('load.User.EDIT_PROFILE_FAILED')
          });
        }
      );
    }

    function editAddress(addressId) {
      for (var index = 0; index < vm.user.addresses.length; index++) {
        if (addressId && vm.user.addresses[index]._id === addressId) {
          vm.dataAddress._id = vm.user.addresses[index]._id;
          vm.dataAddress.address = vm.user.addresses[index].address;
          vm.dataAddress.country = vm.user.addresses[index].country;
          vm.dataAddress.city = vm.user.addresses[index].city;
          vm.dataAddress.postalCode = '';
          vm.dataAddress.zone = vm.user.addresses[index].zone;
          vm.dataAddress.isDefaultAddress = vm.user.addresses[index].isDefaultAddress;
        }
      }
    }

    // Remove existing Address
    function removeAddress(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        if (id) {
          var newAddresses = [];
          for (var index = 0; index < vm.user.addresses.length; index++) {
            if (vm.user.addresses[index]._id !== id) {
              newAddresses.push(vm.user.addresses[index]);
            }
          }

          vm.user.addresses = newAddresses;
          var user = new UsersService(vm.user);

          user.$update(
            function (response) {
              $scope.$broadcast('show-errors-reset', 'vm.userForm');

              Notification.success({
                message:
                  '<i class="glyphicon glyphicon-ok"></i> ' +
                  $translate.instant('load.User.EDIT_PROFILE_SUCCESSFUL')
              });
              Authentication.user = response;
            },
            function (response) {
              Notification.warning({
                message: response.data.message,
                title:
                  '<i class="glyphicon glyphicon-remove"></i> ' +
                  $translate.instant('load.User.EDIT_PROFILE_FAILED')
              });
            }
          );
        }
      }
    }
  }
})();
