(function () {
  'use strict';

  // Configuring The Discount Massives Module
  angular.module('discountMassives').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'discounts', {
      title: 'DISCOUNT_MASSIVE.LIST',
      state: 'discountMassives.list',
      module: ['discountMassives'],
      roles: ['admin']
    });
  }
})();
