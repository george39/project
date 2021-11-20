(function () {
  'use strict';

  // Configuring The Thirds Module
  angular.module('thirds').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'THIRD',
    //   state: 'thirds',
    //   ico: 'far fa-newspaper',
    //   module: ['thirds'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'THIRD.LIST',
      state: 'thirds.list',
      module: ['thirds'],
      roles: ['admin']
    });
  }
})();
