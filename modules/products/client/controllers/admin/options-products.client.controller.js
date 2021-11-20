(function () {
  'use strict';

  angular.module('products').controller('ProductsOptionsController', ProductsOptionsController);

  ProductsOptionsController.$inject = ['$state', '$window', 'Authentication', 'Notification', '$translate'];

  function ProductsOptionsController($state, $window, Authentication, Notification, $translate) {
    var vm = this;

    vm.form = Authentication.form;
    vm.product = Authentication.product;
  }
})();
