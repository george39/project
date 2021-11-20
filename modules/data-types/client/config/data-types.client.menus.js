(function () {
  'use strict';

  // Configuring The Data Types Module
  angular.module('dataTypes').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'DATA_TYPE',
    //   state: 'dataTypes',
    //   ico: 'far fa-newspaper',
    //   module: ['dataTypes'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'DATA_TYPE.LIST',
      state: 'dataTypes.list',
      module: ['dataTypes'],
      roles: ['admin']
    });
  }
})();
