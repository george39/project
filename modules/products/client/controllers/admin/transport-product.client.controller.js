(function () {
  'use strict';

  angular.module('products').controller('ProductsTransportController', ProductsTransportController);

  ProductsTransportController.$inject = ['$state', '$window', 'Authentication', 'Notification', '$translate'];

  function ProductsTransportController($state, $window, Authentication, Notification, $translate) {
    var vm = this;

    vm.form = Authentication.form;
    vm.product = Authentication.product;

    vm.listShippers = [];

    var optionsShippers = {
      sort: {
        modified: 'desc'
      }
    };

    vm.product.findAllShippers(optionsShippers, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listShippers.push({ _id: rst[item]._id, name: rst[item].third_id.name });
        }
      }
    });
  }
})();
