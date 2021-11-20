(function () {
  'use strict';

  // Configuring The Taxes Module
  angular.module('taxes').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'TAX',
    //   state: 'taxes',
    //   ico: 'far fa-newspaper',
    //   module: ['taxes'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'TAX.LIST',
      state: 'taxes.list',
      module: ['taxes'],
      roles: ['admin']
    });
  }
})();
