(function () {
  'use strict';

  // Configuring The Shippers Module
  angular.module('shippers').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'SHIPPER',
    //   state: 'shippers',
    //   ico: 'fas fa-shipping-fast',
    //   module: ['shippers'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });
    // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'shippers', {
    //   title: 'SHIPPER.LIST',
    //   state: 'shippers.list',
    //   module: ['shippers'],
    //   roles: ['admin']
    // });
  }
})();
