(function () {
  'use strict';

  // Configuring The Discount Lists Module
  angular.module('discountLists').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'discounts', {
      title: 'DISCOUNT_LIST.LIST',
      state: 'discountLists.list',
      module: ['discountLists'],
      roles: ['admin']
    });
  }
})();
