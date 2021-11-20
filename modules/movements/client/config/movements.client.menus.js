(function () {
  'use strict';

  // Configuring The Movements Module
  angular.module('movements').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'MOVEMENT',
    //   state: 'movements',
    //   ico: 'far fa-newspaper',
    //   module: ['movements'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'orders', {
      title: 'MOVEMENT.LIST',
      state: 'movements.list',
      module: ['movements'],
      roles: ['admin']
    });
  }
})();
