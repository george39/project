(function () {
  'use strict';

  angular.module('products').controller('ProductsSeoController', ProductsSeoController);

  ProductsSeoController.$inject = ['$state', '$window', 'Authentication', 'Notification', '$translate'];

  function ProductsSeoController($state, $window, Authentication, Notification, $translate) {
    var vm = this;
    vm.form = Authentication.form;
    vm.product = Authentication.product;

    vm.listLangs = [];
    if (!vm.product.seo) {
      vm.product.seo = [];
    }

    var optionsLangs = {
      field: [],
      sort: {
        modified: 'desc'
      },
      filter: {},
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    vm.product.findAllLangs(optionsLangs, function (rst) {
      if (rst.results.length > 0) {
        for (var item in rst.results) {
          if (!rst.results[item]._id) {
            continue;
          }
          vm.listLangs.push({ _id: rst.results[item]._id, name: rst.results[item].name });
        }
      }
    });
  }
})();
