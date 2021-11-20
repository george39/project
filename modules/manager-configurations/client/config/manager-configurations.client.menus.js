(function () {
  'use strict';

  // Configuring The Manager Configurations Module
  angular.module('managerConfigurations').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'MANAGER_CONFIGURATION',
    //   state: 'managerConfigurations',
    //   ico: 'far fa-newspaper',
    //   module: ['managerConfigurations'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'MANAGER_CONFIGURATION.LIST',
      state: 'managerConfigurations.list',
      module: ['managerConfigurations'],
      roles: ['admin']
    });
  }
})();
