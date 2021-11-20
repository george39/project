(function () {
  'use strict';

  angular.module('products').controller('ProductsPriceController', ProductsPriceController);

  ProductsPriceController.$inject = [
    '$state',
    '$window',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function ProductsPriceController($state, $window, Authentication, Notification, $translate) {
    var vm = this;

    vm.form = Authentication.form;
    vm.product = Authentication.product;
    vm.calculateNewValue = calculateNewValue;

    vm.listTaxes = {};
    vm.listTypeDiscount = {};
    vm.listTypeValueDiscount = {};
    vm.listDiscountLists = [];

    var optionsTypeDiscount = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeDiscount' }
    };

    vm.product.findAllDataTypesByDiscount(optionsTypeDiscount, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listTypeDiscount[rst[item]._id] = rst[item].nameLang;
        }
      }
    });

    var optionsTypeValueDiscount = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeValueDiscount' }
    };

    vm.product.findAllDataTypesByDiscount(optionsTypeValueDiscount, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }

          vm.listTypeValueDiscount[rst[item]._id] = rst[item].nameLang;
        }
      }
    });

    var optionsTaxes = {
      sort: {
        modified: 'desc'
      }
    };

    vm.product.findAllTaxes(optionsTaxes, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listTaxes[rst[item]._id] = {
            name: rst[item].nameLang,
            value: rst[item].value
          };
        }
      }
    });

    var optionsPriceList = {
      sort: {
        modified: 'desc'
      }
    };

    vm.product.findAllDiscountLists(optionsPriceList, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listDiscountLists.push({ _id: rst[item]._id, name: rst[item].name });
        }
      }
    });

    vm.changeLocalDiscount = function () {
      var valueNewPrice = 0;
      var price = vm.product.priceTaxIncluded;

      if (vm.listTypeValueDiscount[vm.product.localDiscount.typeDiscount] === 'percent') {
        vm.product.localDiscount.discountValue =
          vm.product.localDiscount.discountValue > 100
            ? 100
            : vm.product.localDiscount.discountValue;

        var valueDiscount = Math.trunc(
          price - (price * vm.product.localDiscount.discountValue) / 100
        );

        valueNewPrice = Math.ceil(valueDiscount / 50) * 50;
      } else if (vm.listTypeValueDiscount[vm.product.localDiscount.typeDiscount] === 'value') {
        vm.product.localDiscount.discountValue =
          vm.product.localDiscount.discountValue > price
            ? price
            : vm.product.localDiscount.discountValue;

        valueNewPrice = price - vm.product.localDiscount.discountValue;
      }

      if (valueNewPrice < 0) {
        valueNewPrice = 0;
      }

      vm.product.localDiscount.newPrice = valueNewPrice;
    };

    vm.priceWithTax = function () {
      if (vm.product.tax_id) {
        var valueNewPriceTax = Math.trunc(
          vm.product.price + (vm.product.price * vm.listTaxes[vm.product.tax_id].value) / 100
        );

        vm.product.priceTaxIncluded = Math.ceil(valueNewPriceTax / 50) * 50;
      } else {
        vm.product.priceTaxIncluded = vm.product.price;
      }
    };

    function calculateNewValue(fromInput, indexListPrice) {
      var valueNewPrice = 0;
      var price = vm.product.priceTaxIncluded;

      if (fromInput === 'discountValue') {
        vm.product.discountList_id[indexListPrice].name =
          vm.listTypeValueDiscount[vm.product.discountList_id[indexListPrice].typeDiscount];
        if (
          vm.listTypeValueDiscount[vm.product.discountList_id[indexListPrice].typeDiscount] ===
          'percent'
        ) {
          vm.product.discountList_id[indexListPrice].discountValue =
            vm.product.discountList_id[indexListPrice].discountValue > 100
              ? 100
              : vm.product.discountList_id[indexListPrice].discountValue;

          var valueDiscount = Math.trunc(
            price - (price * vm.product.discountList_id[indexListPrice].discountValue) / 100
          );

          valueNewPrice = Math.ceil(valueDiscount / 50) * 50;
        } else if (
          vm.listTypeValueDiscount[vm.product.discountList_id[indexListPrice].typeDiscount] ===
          'value'
        ) {
          vm.product.discountList_id[indexListPrice].discountValue =
            vm.product.discountList_id[indexListPrice].discountValue > price
              ? price
              : vm.product.discountList_id[indexListPrice].discountValue;

          valueNewPrice = price - vm.product.discountList_id[indexListPrice].discountValue;
        }

        if (valueNewPrice < 0) {
          valueNewPrice = 0;
        }

        vm.product.discountList_id[indexListPrice].newPrice = valueNewPrice;
      }

      if (fromInput === 'price') {
        vm.priceWithTax();
        price = vm.product.priceTaxIncluded;

        angular.forEach(vm.product.discountList_id, function (element, index) {
          valueNewPrice = 0;

          if (
            vm.listTypeValueDiscount[vm.product.discountList_id[index].typeDiscount] === 'percent'
          ) {
            valueNewPrice = Math.trunc(
              price - (price * vm.product.discountList_id[index].discountValue) / 100
            );
            valueNewPrice = Math.ceil(valueNewPrice / 50) * 50;
          } else if (
            vm.listTypeValueDiscount[vm.product.discountList_id[index].typeDiscount] === 'value'
          ) {
            valueNewPrice = price - vm.product.discountList_id[index].discountValue;
          }

          if (valueNewPrice < 0) {
            valueNewPrice = 0;
          }

          vm.product.discountList_id[index].newPrice = valueNewPrice;
        });

        if (vm.product.localDiscount) {
          if (vm.listTypeValueDiscount[vm.product.localDiscount.typeDiscount] === 'percent') {
            var newPrice = 0;

            newPrice = Math.trunc(price - (price * vm.product.localDiscount.discountValue) / 100);

            vm.product.localDiscount.newPrice = Math.ceil(newPrice / 50) * 50;
          }

          if (vm.listTypeValueDiscount[vm.product.localDiscount.typeDiscount] === 'value') {
            vm.product.localDiscount.newPrice = price - vm.product.localDiscount.discountValue;
          }
        }
      }
    }
  }
})();
