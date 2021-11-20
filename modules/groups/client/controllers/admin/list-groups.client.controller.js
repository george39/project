(function () {
  'use strict';

  angular.module('groups').controller('GroupsListController', GroupsListController);

  GroupsListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'groupsResolve',
    'GroupsService',
    'NgTableParams',
    'Notification'
  ];

  function GroupsListController(
    $scope,
    $state,
    $window,
    groups,
    GroupsService,
    NgTableParams,
    Notification
  ) {
    // debugger;
    var vm = this;
    vm.groups = groups;

    vm.remove = remove;
    vm.isEditing = false;

    vm.cols = [
      {
        field: 'name',
        title: 'Name',
        filter: {
          content: 'text'
        },
        sortable: 'name',
        dataType: 'text'
      },
      {
        field: 'option',
        title: 'Option',
        filter: {
          content: 'text'
        },
        sortable: 'option',
        dataType: 'text'
      },
      {
        field: 'action',
        title: 'Actions',
        dataType: 'command'
      }
    ];

    var initialParams = {
      page: 1,
      count: 5,
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    var initialSettings = {
      counts: [5, 10, 15],
      getData: function (params) {
        return GroupsService.get(params.parameters()).$promise.then(function (rstGroupsService) {
          params.total(rstGroupsService.total);
          return rstGroupsService.results;
        });
      }
    };

    vm.tableParams = new NgTableParams(initialParams, initialSettings);

    // Remove existing Group
    function remove(id) {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.groups.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message: '<i class="fas fa-trash-alt"></i> Group deleted fail!'
            });
            return false;
          }
          vm.tableParams.reload().then(function (data) {
            if (data.length === 0 && vm.tableParams.total() > 0) {
              vm.tableParams.page(vm.tableParams.page() - 1);
              vm.tableParams.reload();
            }
          });
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> Group deleted successfully!'
          });
        });
      }
    }
  }
})();
