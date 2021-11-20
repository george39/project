(function () {
  'use strict';

  angular.module('core').controller('SidebarController', SidebarController);

  SidebarController.$inject = ['$scope', '$resource', '$state', 'Authentication', 'menuService'];

  function SidebarController($scope, $resource, $state, Authentication, menuService) {
    var vm = this;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');
    vm.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

    if (vm.authentication.user === 'null') {
      vm.authentication.user = false;
    }

    if (vm.authentication.user !== 'null' && typeof vm.authentication.user === 'string') {
      vm.authentication.user = JSON.parse(vm.authentication.user);
    }

    vm.toggleSidebar = toggleSidebar;
    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }

    function toggleSidebar(e) {
      // Toggle the side navigation
      $('body').toggleClass('sidebar-toggled');
      $('.sidebar').toggleClass('toggled');
      if ($('.sidebar').hasClass('toggled')) {
        $('.sidebar .collapse').collapse('hide');
      }
    }
  }
})();
