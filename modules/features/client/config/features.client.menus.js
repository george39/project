(function () {
  'use strict';

  // Configuring The Features Module
  angular.module('features').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'FEATURE',
    //   state: 'features',
    //   ico: 'far fa-newspaper',
    //   module: ['features'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'catalogue', {
      title: 'FEATURE.LIST',
      state: 'features.list',
      module: ['features'],
      roles: ['admin']
    });
  }
})();
