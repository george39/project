(function () {
  'use strict';

  angular.module('users.admin').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Users module
  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'ADMIN.USERS',
      state: 'admin.users',
      module: ['users'],
      roles: ['admin']
    });
  }
})();
