(function () {
  'use strict';

  // Configuring The Groups Module
  angular.module('groups').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'ADMIN.GROUPS',
      state: 'groups.list',
      module: ['groups'],
      roles: ['admin']
    });
  }
})();
