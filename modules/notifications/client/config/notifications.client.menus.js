(function () {
  'use strict';

  // Configuring The Notifications Module
  angular.module('notifications').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'NOTIFICATION',
      state: 'notifications',
      ico: 'far fa-newspaper',
      module: ['notifications'],
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'notifications', {
      title: 'NOTIFICATION.LIST',
      state: 'notifications.list',
      module: ['notifications'],
      roles: ['admin']
    });
  }
})();
