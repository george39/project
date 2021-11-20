(function () {
  'use strict';

  // Configuring The Orders Module
  angular.module('orders').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'ORDER',
    //   state: 'orders',
    //   ico: 'far fa-newspaper',
    //   module: ['orders'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'orders', {
      title: 'ORDER.LIST',
      state: 'orders.list',
      module: ['orders'],
      roles: ['admin']
    });
  }
})();
