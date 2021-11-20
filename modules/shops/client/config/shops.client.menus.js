(function () {
  'use strict';

  // Configuring The Shops Module
  angular.module('shops').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'SHOP',
      state: 'shops',
      ico: 'fas fa-warehouse',
      module: ['shops'],
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'shops', {
      title: 'SHOP.LIST',
      state: 'shops.list',
      module: ['shops'],
      roles: ['admin']
    });
  }
})();
