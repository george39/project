(function () {
  'use strict';

  angular
    .module('discountMassives')
    .controller('DiscountMassivesController', DiscountMassivesController);

  DiscountMassivesController.$inject = [
    '$state',
    '$window',
    'discountMassiveResolve',
    'Authentication',
    'Notification',
    '$translate',
    'ProductsService',
    '$resource'
  ];

  function DiscountMassivesController(
    $state,
    $window,
    discountMassive,
    Authentication,
    Notification,
    $translate,
    ProductsService,
    $resource
  ) {
    const vm = this;
    const productsService = new ProductsService();
    let categoriesToRemove = [];

    findCategories();

    vm.discountMassive = discountMassive;
    let categoriesBackUp = vm.discountMassive._id ? vm.discountMassive.categories : null;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.listProducts = [];
    vm.categories = {};

    vm.searchProducts = searchProducts;
    vm.checkCategories = {};
    vm.checkProducts = {};

    vm.onCheckAllCategory = checkAllCategory;
    vm.onCheckProduct = checkProduct;

    vm.changeCategories = (categories = []) => {
      if (!categoriesBackUp) {
        categoriesBackUp = categories;
        return;
      }

      categoriesBackUp.forEach((category) => {
        if (!categories.includes(category)) {
          categoriesToRemove.push(category);
        }
      });

      categoriesToRemove = categoriesToRemove.filter((category) => {
        return !categories.includes(category);
      });

      categoriesBackUp = categories;
    };

    function searchProducts(filter, callback) {
      const params = {
        categories: JSON.stringify(filter)
      };

      if (!filter || filter.length === 0) {
        vm.categoriesResult = {};
        return;
      }

      const massDisc = $resource('/api/products/massiveDiscounts', params).get({}).$promise;
      massDisc
        .then((products) => {
          if (!products || typeof products !== 'object') {
            return;
          }

          if (Object.keys(products).length === 0) {
            vm.categoriesResult = {};
            return;
          }

          const categoriesNames = {};

          for (const i in products) {
            if (!Array.isArray(products[i])) continue;
            const categoryNameWithDashes = vm.categories[i].trim();
            const splittedName = categoryNameWithDashes.split('-');
            const lastPosition = splittedName.length - 1;
            categoriesNames[i] = splittedName[lastPosition].trim();
          }

          const isObjectId = /^[0-9a-fA-F]{24}$/;
          vm.discountMassive.categories = Object.keys(products).filter((key) =>
            isObjectId.test(key)
          );

          vm.categoriesResult = products;
          vm.categoriesNames = categoriesNames;

          if (callback) callback(true);
        })
        .catch((err) => console.error(err));
    }

    vm.checkAll = () => {
      const categories = Object.keys(vm.categoriesResult);
      categories.forEach((category) => checkAllCategory(category, true));
    };

    const optionsValueDiscount = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeValueDiscount', nameLang: 'percent' }
    };

    productsService.findAllDataTypesByDiscount(optionsValueDiscount, (rst) => {
      if (rst.length > 0) {
        vm.listTypeValueDiscount = rst.map((typeDiscount) => {
          return { _id: typeDiscount._id, name: typeDiscount.nameLang };
        });
      }
    });

    function findCategories() {
      const optionsCategories = {
        sort: {
          modified: 'desc'
        },
        filter: {
          'categoryLang.name': {
            $not: { $regex: 'manualidades', $options: 'i' }
          },
          'ancestors.categoryLang.name': {
            $not: { $regex: 'manualidades', $options: 'i' }
          }
        }
      };

      productsService.findAllCategories(optionsCategories, (rst) => {
        if (rst.length > 0) {
          for (const i in rst) {
            if (!rst[i]._id) continue;
            if (rst[i].parent === null) continue; // dont include 'Inicio' category
            vm.categories[rst[i]._id] = rst[i].categoryLang[0].name;
          }
        }
      });
    }

    const optionsProducts = {
      field: ['productLang'],
      sort: {
        modified: 'desc'
      }
    };

    vm.discountMassive.findAllProducts(optionsProducts, (rst) => {
      if (rst.length > 0) {
        vm.listProducts = rst.map((product) => {
          return { _id: product._id, name: product.productLang[0].name };
        });
      }
    });

    function checkAllCategory(categoryId, value) {
      const products = vm.categoriesResult[categoryId];

      if (!Array.isArray(products)) return;

      if (!value) {
        const productsIds = products.map((product) => product._id);
        const existingProducts = vm.discountMassive.products;

        vm.discountMassive.products = existingProducts.filter(
          (product) => !productsIds.includes(product)
        );
      }

      for (const product of products) {
        checkProduct(categoryId, product._id, value);
      }
    }

    function checkProduct(categoryId, productId, value) {
      vm.checkProducts[productId] = value;

      if (value) {
        if (!vm.discountMassive.products.includes(productId)) {
          vm.discountMassive.products.push(productId);
        }

        checkCategory(categoryId);
        return;
      }

      if (!value && vm.discountMassive.products.includes(productId)) {
        const index = vm.discountMassive.products.indexOf(productId);
        vm.discountMassive.products.splice(index, 1);
        uncheckCategory(categoryId);
        categoriesToRemove.push(categoryId);
      }
    }

    function checkCategory(categoryId) {
      const products = vm.categoriesResult[categoryId];

      let allInTheArray;
      for (const i in products) {
        if (!products[i]._id) continue;
        allInTheArray = vm.discountMassive.products.includes(products[i]._id);
        if (!allInTheArray) return;
      }

      vm.checkCategories[categoryId] = true;
    }

    function uncheckCategory(categoryId) {
      const products = vm.categoriesResult[categoryId];

      let isStillInTheArray;
      for (const i in products) {
        if (!products[i]._id) continue;
        isStillInTheArray = vm.discountMassive.products.includes(products[i]._id);

        if (isStillInTheArray || (products.length === 1 && !isStillInTheArray)) {
          vm.checkCategories[categoryId] = false;
          categoriesToRemove.push(categoryId);
          return;
        }
      }
    }

    vm.redirect = () => {
      $state.go('discountMassives.list');
      Notification.success({
        message:
          '<i class="far fa-thumbs-up"></i> ' + $translate.instant('DISCOUNT_MASSIVE.SAVED_OK')
      });
    };

    // Remove existing Discount massive
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.discountMassive.$remove(function () {
          $state.go('discountMassives.list');
          Notification.success({
            message:
              '<i class="far fa-thumbs-up"></i> ' +
              $translate.instant('DISCOUNT_MASSIVE.DELETED_OK')
          });
        });
      }
    }

    function errorCallback(res) {
      Notification.warning({
        message: res.data.message,
        title:
          '<i class="fas fa-trash-alt"></i> ' + $translate.instant('DISCOUNT_MASSIVE.SAVED_FAIL')
      });
    }

    vm.overrideProducts = () => {
      const query = $resource('/api/discountMassives/' + vm.currentMassiveDiscountId + '/override');
      query
        .save({
          products: vm.productsIds,
          productsInCommon: vm.productsInCommon
        })
        .$promise.then(() => vm.redirect())
        .catch(errorCallback);
    };

    // Save Discount massive
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.discountMassiveForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new discountMassive, or update the current instance
      // vm.discountMassive.createOrUpdate().then(successCallback).catch(errorCallback);
      vm.discountMassive.categories = vm.discountMassive.categories.filter((category) => {
        return !categoriesToRemove.includes(category);
      });

      categoriesToRemove.forEach((category) => {
        checkAllCategory(category, false);
      });

      if (!vm.discountMassive._id) {
        const query = $resource('/api/discountMassives');
        query.save(vm.discountMassive).$promise.then(successCallback).catch(errorCallback);
      } else {
        const { _id } = vm.discountMassive;
        const query = $resource('/api/discountMassives/' + _id, null, {
          update: { method: 'PUT' }
        });

        query.update(vm.discountMassive).$promise.then(successCallback).catch(errorCallback);
      }

      function successCallback(res) {
        if (res.productsInCommon) {
          vm.currentMassiveDiscountId = res._id;
          vm.productsInCommon = res.productsInCommon;
          vm.productsIds = res.productsIds;
          vm.disableSaveButton = true;
          return false;
        }

        vm.redirect();
      }
    }

    function initProductsCheck(filter) {
      const params = {
        field: ['category_id'],
        filter: {
          _id: {
            $in: filter
          }
        }
      };

      productsService.findAll(params, (products) => {
        searchProducts(vm.discountMassive.categories, () => {
          if (products) {
            for (const i in products) {
              if (!products[i]._id) continue;
              checkProduct(products[i].category_id[0], products[i]._id, true);
            }
          }
        });
      });
    }

    $(document).ready(() => {
      const categorySelect = $('.select-multiple');
      categorySelect.select2();
    });

    if (!vm.discountMassive._id) {
      vm.discountMassive.products = [];
    } else {
      initProductsCheck(vm.discountMassive.products);
    }
  }
})();
