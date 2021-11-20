(function () {
  'use strict';

  // Configuring The Crafts Module
  angular.module('crafts').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'orders', {
      title: 'CRAFT.LIST',
      state: 'crafts-admin.list',
      module: ['crafts'],
      roles: ['admin']
    });
  }
})();
