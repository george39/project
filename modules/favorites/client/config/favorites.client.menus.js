(function () {
  'use strict';

  // Configuring The Favorites Module
  angular.module('favorites').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'FAVORITE',
      state: 'favorites',
      ico: 'far fa-newspaper',
      module: ['favorites'],
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'favorites', {
      title: 'FAVORITE.LIST',
      state: 'favorites.list',
      module: ['favorites'],
      roles: ['admin']
    });
  }
})();
