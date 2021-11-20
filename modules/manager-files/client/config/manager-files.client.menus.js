(function () {
  'use strict';

  // Configuring The Manager Files Module
  angular.module('managerFiles').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'MANAGER_FILE.LIST',
      state: 'managerFiles.list',
      module: ['managerFiles'],
      roles: ['admin']
    });
  }
})();
