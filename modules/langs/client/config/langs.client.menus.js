(function () {
  'use strict';

  // Configuring The Langs Module
  angular.module('langs').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'LANG.LIST',
      state: 'langs.list',
      module: ['langs'],
      roles: ['admin']
    });
  }
})();
