(function () {
  'use strict';

  angular.module('products').controller('ProductsQuantityController', ProductsQuantityController);

  ProductsQuantityController.$inject = [
    '$state',
    '$window',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function ProductsQuantityController($state, $window, Authentication, Notification, $translate) {
    var vm = this;

    vm.form = Authentication.form;
    vm.product = Authentication.product;
    vm.orderCombinations = orderCombinations;
    vm.generateCombinations = generateCombinations;
    vm.removeCombination = removeCombination;
    vm.product.movements = [];
    vm.movement = {};

    vm.listMakers = [];
    vm.listProviders = [];
    vm.listFeatureDetails = [];

    vm.listTypeCombination = [
      { id: 1, name: 'Producto Simple' },
      { id: 2, name: 'Producto con Combianciones' }
    ];
    vm.textCombinations = [];
    vm.listCombinations = [];

    var optionsMakers = {
      sort: {
        modified: 'desc'
      },
      filter: { 'typeThird_id.nameLang': 'Fabricante' }
    };

    vm.product.findAllThirdByType(optionsMakers, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listMakers.push({ _id: rst[item]._id, name: rst[item].name });
        }
      }
    });

    var optionsProviders = {
      sort: {
        modified: 'desc'
      },
      filter: { 'typeThird_id.nameLang': 'Proveedor' }
    };

    vm.product.findAllThirdByType(optionsProviders, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listProviders.push({ _id: rst[item]._id, name: rst[item].name });
        }
      }
    });

    var optionsFeatureDetails = {
      field: ['name'],
      sorting: ['feature_id.order', 'order'],
      filter: {},
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    vm.product.findAllFeatureDetails(optionsFeatureDetails, function (rst) {
      vm.listFeatureDetails = rst;
    });

    var optionsMovements = {
      sort: {
        modified: 'desc'
      },
      filter: { 'product_id._id': vm.product._id, status: true }
    };

    vm.product.findAllMoventsByProduct(optionsMovements, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          var obj = {
            sons: rst[item].featureDetail_id,
            data: {
              quantity: rst[item].balance,
              price: rst[item].price,
              managerFile_id: rst[item].managerFile_id,
              _id: rst[item]._id,
              isDefault: rst[item].isDefault,
              status: true
            }
          };
          if (rst[item].price) {
            vm.movement[item] = true;
          }

          vm.listCombinations.push(obj);
        }
      }
    });

    vm.changeDefault = function (index) {
      for (var i = 0; i < vm.product.movements.length; i++) {
        if (i !== index) {
          vm.product.movements[i].data.isDefault = false;
        }
      }
    };

    function orderCombinations(isChecked, father, son) {
      var checked;
      angular.forEach(isChecked, function (valueChecked, keyChecked) {
        if (keyChecked === son._id) {
          checked = valueChecked;
        }
      });

      var indexFather;
      var indexSon;

      if (checked === true) {
        indexFather = vm.textCombinations.findIndex(function (element) {
          return element._id === father._id;
        });

        if (indexFather === -1) {
          vm.textCombinations.push({
            _id: father._id,
            nameLang: father.nameLang,
            data: []
          });

          indexFather = vm.textCombinations.findIndex(function (element) {
            return element._id === father._id;
          });
        }

        indexSon = vm.textCombinations[indexFather].data.findIndex(function (element) {
          return element._id === son._id;
        });

        if (indexSon === -1) {
          vm.textCombinations[indexFather].data.push({
            _id: son._id,
            nameLang: son.nameLang,
            order: son.order,
            parentId: father._id,
            parentNameLang: father.nameLang
          });
        }
      }

      if (checked === false) {
        indexFather = vm.textCombinations.findIndex(function (element) {
          return element._id === father._id;
        });

        if (indexFather >= -1) {
          indexSon = vm.textCombinations[indexFather].data.findIndex(function (element) {
            return element._id === son._id;
          });
          if (indexSon >= -1) {
            vm.textCombinations[indexFather].data.splice(indexSon, 1);

            if (vm.textCombinations[indexFather].data.length === 0) {
              vm.textCombinations.splice(indexFather, 1);
            }
          }
        }
      }
    }

    function generateCombinations(args) {
      var r = [];
      var max = args.length - 1;
      function helper(arr, i) {
        for (var j = 0, l = args[i].data.length; j < l; j++) {
          var a = arr.slice(0); // clone arr
          a.push(args[i].data[j]);
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);

      angular.forEach(r, function (valueR) {
        var obj = {
          sons: valueR,
          data: {
            quantity: 0,
            status: true
          }
        };

        var exist = existCombination(obj, vm.listCombinations);

        if (!exist) {
          vm.listCombinations.push(obj);
        }
      });

      vm.textCombinations = [];
      vm.product.combinations = cleanChecked(vm.product.combinations);
    }

    function existCombination(newCombination, listCombinations) {
      var exist = false;

      angular.forEach(listCombinations, function (valueList) {
        if (valueList.sons.length === newCombination.sons.length) {
          var countCompare = 0;

          angular.forEach(newCombination.sons, function (valueSon) {
            var indexSon = valueList.sons.findIndex(function (element) {
              return element._id === valueSon._id;
            });

            if (indexSon >= 0) {
              countCompare++;
            }
          });

          if (countCompare === valueList.sons.length) {
            exist = true;
          }
        }
      });

      return exist;
    }

    function cleanChecked(combinations) {
      angular.forEach(combinations, function (value, key) {
        combinations[key] = false;
      });
      return combinations;
    }

    function removeCombination(index) {
      vm.listCombinations.splice(index, 1);
    }
  }
})();
