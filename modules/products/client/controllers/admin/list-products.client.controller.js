(function () {
  'use strict';

  angular.module('products').controller('ProductsListController', ProductsListController);

  ProductsListController.$inject = [
    '$window',
    'productsResolve',
    'ProductsService',
    'NgTableParams',
    'Notification',
    '$translate',
    'managerFileResolve'
  ];

  function ProductsListController(
    $window,
    products,
    ProductsService,
    NgTableParams,
    Notification,
    $translate,
    managerFile
  ) {
    // debugger;
    const vm = this;
    vm.products = products;
    vm.managerFile = managerFile;

    vm.remove = remove;
    vm.isEditing = false;

    vm.listCategories = [];

    const optionsCategories = {
      field: ['name'],
      sort: {
        modified: 'desc'
      }
    };

    vm.products.findAllCategories(optionsCategories, function (rst) {
      if (rst.length > 0) {
        for (const item in rst) {
          if (!rst[item]._id || /inicio/i.test(rst[item].categoryLang[0].originalName)) continue;

          vm.listCategories.push({
            id: rst[item]._id,
            title: rst[item].categoryLang[0].originalName
          });
        }
      }
    });

    vm.listManagerFiles = [];

    const optionsManagerFiles = {
      field: ['name'],
      sort: {
        modified: 'desc'
      }
    };

    vm.products.findAllManagerFiles(optionsManagerFiles, function (rst) {
      if (rst.results.length > 0) {
        for (const item in rst.results) {
          if (!rst.results[item]._id) {
            continue;
          }
          vm.listManagerFiles.push({ id: rst.results[item]._id, title: rst.results[item].name });
        }
      }
    });

    vm.listTaxes = [];

    const optionsTaxes = {
      field: ['name'],
      sort: {
        modified: 'desc'
      }
    };

    vm.products.findAllTaxes(optionsTaxes, function (rst) {
      if (rst.length > 0) {
        for (const item in rst) {
          if (!rst[item]._id) continue;
          vm.listTaxes.push({ id: rst[item]._id, title: rst[item].nameLang });
        }
      }
    });

    vm.listMakers = [];

    const optionsMakers = {
      sort: {
        modified: 'desc'
      },
      filter: {
        'typeThird_id.nameLang': 'Fabricante'
      }
    };

    vm.products.findAllThirdByType(optionsMakers, function (rst) {
      if (rst.length > 0) {
        for (const item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listMakers.push({ id: rst[item]._id, title: rst[item].name });
        }
      }
    });

    vm.listProviders = [];

    const optionsProviders = {
      sort: {
        modified: 'desc'
      },
      filter: {
        'typeThird_id.nameLang': 'Proveedor'
      }
    };

    vm.products.findAllThirdByType(optionsProviders, function (rst) {
      if (rst.length > 0) {
        for (const item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listProviders.push({ id: rst[item]._id, title: rst[item].name });
        }
      }
    });

    vm.listShops = [];

    const optionsShops = {
      field: ['name'],
      sort: {
        modified: 'desc'
      }
    };

    vm.products.findAllShops(optionsShops, function (rst) {
      if (rst.results.length > 0) {
        for (const item in rst.results) {
          if (!rst.results[item]._id) {
            continue;
          }
          vm.listShops.push({ id: rst.results[item]._id, title: rst.results[item].name });
        }
      }
    });

    const initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'user',
          select: 'displayName'
        },
        {
          path: 'managerFile_id',
          select: 'originalName path'
        },
        {
          path: 'category_id',
          select: 'categoryLang'
        },
        {
          path: 'tax_id',
          select: 'nameLang'
        },
        {
          path: 'maker_id',
          select: 'name'
        },
        {
          path: 'provider_id',
          select: 'name'
        }
      ]
    };

    const initialSettings = {
      counts: [],
      getData: function (params) {
        return ProductsService.get(params.parameters()).$promise.then(function (
          rstProductsService
        ) {
          params.total(rstProductsService.total);
          return rstProductsService.results;
        });
      }
    };

    vm.tableParams = new NgTableParams(initialParams, initialSettings);

    // Remove existing Product
    function remove(data) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.removeAllFiles({ id: data.managerFile_id }, function (rstRemoveFile) {
          if (rstRemoveFile.error) {
            Notification.warning({
              message: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('SHOP.DELETED_FAIL')
            });
            return false;
          }

          vm.products.removeItem(data._id, function (rst) {
            if (rst.error) {
              Notification.warning({
                message:
                  '<i class="fas fa-trash-alt"></i> ' + $translate.instant('PRODUCT.DELETED_FAIL')
              });
              return false;
            }
            vm.tableParams.reload().then(function (data) {
              if (data.length === 0 && vm.tableParams.total() > 0) {
                vm.tableParams.page(vm.tableParams.page() - 1);
                vm.tableParams.reload();
              }
            });
            Notification.success({
              message:
                '<i class="far fa-thumbs-up"></i> ' + $translate.instant('PRODUCT.DELETED_OK')
            });
          });
        });
      }
    }
  }
})();
