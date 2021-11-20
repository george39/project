(function () {
  'use strict';

  // Configuring The Categories Module
  angular.module('categories').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'CATEGORY',
    //   state: 'categories',
    //   ico: 'fab fa-squarespace',
    //   module: ['categories'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'catalogue', {
      title: 'CATEGORY.LIST',
      state: 'categories.list',
      module: ['categories'],
      roles: ['admin']
    });
  }
})();
