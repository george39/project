(function () {
  'use strict';

  angular.module('core').controller('ThankYouController', ThankYouController);

  ThankYouController.$inject = ['productService'];

  function ThankYouController(productService) {
    var vm = this;
    vm.currentLang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');
    var order = localStorage.getItem('order');
    var orderInJson;

    if (order == null) {
      orderInJson = {
        _id: '',
        total: '',
        shipping: ''
      };
    } else {
      orderInJson = JSON.parse(order);
    }
  }
})();
