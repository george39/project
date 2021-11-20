(function () {
  'use strict';

  angular.module('groups').controller('GroupsController', GroupsController);

  GroupsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'groupResolve',
    'moduleResolve',
    'Authentication',
    'Notification'
  ];

  function GroupsController(
    $scope,
    $state,
    $window,
    group,
    moduleResolve,
    Authentication,
    Notification
  ) {
    var vm = this;

    vm.group = group;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.modules = moduleResolve;

    // Remove existing Group
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.group.$remove(function () {
          $state.go('groups.list');
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> Group deleted successfully!'
          });
        });
      }
    }

    // Save Group
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.groupForm');
        return false;
      }

      // Create a new group, or update the current instance
      vm.group.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('groups.list'); // should we send the User to the list or the updated Group's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> Group saved successfully!'
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> Group save error!'
        });
      }
    }
  }
})();
