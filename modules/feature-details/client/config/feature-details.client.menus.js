(function () {
  'use strict';

  // Configuring The Feature Details Module
  angular.module('featureDetails').run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // menuService.addMenuItem('topbar', {
    //   title: 'FEATURE_DETAIL',
    //   state: 'featureDetails',
    //   ico: 'far fa-newspaper',
    //   module: ['featureDetails'],
    //   type: 'dropdown',
    //   roles: ['admin']
    // });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'catalogue', {
      title: 'FEATURE_DETAIL.LIST',
      state: 'featureDetails.list',
      module: ['featureDetails'],
      roles: ['admin']
    });
  }
})();
