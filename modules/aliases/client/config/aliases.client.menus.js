(function () {
  'use strict';

  // Configuring The Aliases Module
  angular.module('aliases').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'ALIAS',
    //   state: 'aliases',
    //   ico: 'far fa-newspaper',
    //   module: ['aliases'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    menuService.addMenuItem('topbar', {
      title: 'ADMIN',
      state: 'admin',
      ico: 'fas fa-fw fa-cog',
      module: [
        'aliases',
        'groups',
        'dataTypes',
        'langs',
        'managerConfigurations',
        'managerFiles',
        'taxes',
        'thirds',
        'users'
      ],
      type: 'dropdown',
      roles: ['admin']
    });

    menuService.addMenuItem('topbar', {
      title: 'CATALOGUE',
      state: 'catalogue',
      ico: 'fas fa-clipboard-list',
      module: ['products', 'categories', 'featureDetails', 'features'],
      type: 'dropdown',
      roles: ['admin']
    });

    menuService.addMenuItem('topbar', {
      title: 'DISCOUNTS',
      state: 'discounts',
      ico: 'fas fa-percent',
      module: ['discountLists', 'discountMassives'],
      type: 'dropdown',
      roles: ['admin']
    });

    menuService.addMenuItem('topbar', {
      title: 'INTERNATIONALIZATION',
      state: 'internationalization',
      ico: 'fas fa-globe',
      module: [],
      type: 'dropdown',
      roles: ['admin']
    });

    menuService.addMenuItem('topbar', {
      title: 'SHIPPER',
      state: 'shippers.list',
      ico: 'fas fa-shipping-fast',
      module: ['shippers'],
      type: '',
      roles: ['admin']
    });

    menuService.addMenuItem('topbar', {
      title: 'ORDER',
      state: 'orders',
      ico: 'fas fa-box-open',
      module: ['orders', 'craft', 'movements'],
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'ALIAS.LIST',
      state: 'aliases.list',
      module: ['aliases'],
      roles: ['admin']
    });
  }
})();
