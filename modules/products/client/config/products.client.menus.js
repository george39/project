(function () {
  'use strict';

  // Configuring The Products Module
  angular.module('products').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'PRODUCT',
    //   state: 'products',
    //   ico: 'far fa-newspaper',
    //   module: ['products'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'catalogue', {
      title: 'PRODUCT.LIST',
      state: 'products.list',
      module: ['products'],
      roles: ['admin']
    });
  }
})();
