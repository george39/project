(function () {
  'use strict';

  angular.module('users').controller('EditProfileController', EditProfileController);

  EditProfileController.$inject = [
    '$scope',
    '$http',
    '$location',
    'UsersService',
    'Authentication',
    'Notification'
  ];

  function EditProfileController(
    $scope,
    $http,
    $location,
    UsersService,
    Authentication,
    Notification
  ) {
    var vm = this;

    vm.user = Authentication.user;
    vm.updateUserProfile = updateUserProfile;

    // Update a user profile
    function updateUserProfile(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      var user = new UsersService(vm.user);

      user.$update(
        function (response) {
          $scope.$broadcast('show-errors-reset', 'vm.userForm');

          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> Edit profile successful!'
          });
          Authentication.user = response;
        },
        function (response) {
          Notification.warning({
            message: response.data.message,
            title: '<i class="fas fa-trash-alt"></i> Edit profile failed!'
          });
        }
      );
    }
  }
})();