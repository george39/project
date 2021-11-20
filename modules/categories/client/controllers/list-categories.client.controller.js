(function () {
  'use strict';

  angular
    .module('categories')
    .controller('CategoriesListClientController', CategoriesListClientController);

  CategoriesListClientController.$inject = ['$resource', 'newCategory', '$state'];

  function CategoriesListClientController($resource, newCategory, $state) {
    const vm = this;
    vm.newCategory = newCategory;
    vm.listCategories = [];
    vm.products = [];
    vm.currentLang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');
    vm.parent = '';
    vm.id = '';
    vm.orderBy = null;
    vm.page = 1;
    vm.totalPages = 0;
    vm.title = 'CATEGORY.LISTCLIENT';
    var showOffers = false;

    // Variable usada cuando se redirecciona desde otra página buscando una categoría en especifico. (Ver CategoryService).
    const category = vm.newCategory.getCurrentCategory();

    if (Object.keys(category).length > 0) {
      if (category.showOffers === true) {
        showOffers = true;
      } else {
        vm.id = category._id;
        vm.parent = category._id;
        vm.title = category.categoryLang[0].originalName;
      }
    }

    vm.newCategory.findCategories({ lang: vm.currentLang }, function (rst) {
      vm.listCategories = rst;
    });

    vm.getPage = function () {
      vm.currentLang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');
      const params = {
        page: vm.page,
        count: 40,
        sort: {},
        filter: {},
        lang: vm.currentLang
      };

      if (vm.orderBy) {
        params.sort = {};

        if (vm.orderBy.indexOf('price') !== -1) {
          params.sort['product.priceTaxIncluded'] =
            vm.orderBy.indexOf('higher') !== -1 ? 'desc' : 'asc';
        } else {
          params.sort[vm.orderBy] = 'desc';
        }
      }

      if (showOffers) {
        params.filter.$and = [
          {
            'product.typeDiscount.nameLang': { $ne: 'none' }
          },
          {
            'product.typeDiscount.nameLang': { $ne: null }
          }
        ];
      }

      params.filter['product.category_id._id'] = vm.id !== '' ? vm.id : undefined;
      params.filter['product.category_id.parent'] = vm.parent !== '' ? vm.parent : undefined;

      var modules = $resource('/api/products/getProducts');
      modules.get(params, function (rst) {
        vm.totalPages = rst.pages;
        vm.products = rst.results;
        console.log('vm.products');
        console.log(vm.products);
        console.log('vm.products');

        const products = vm.products.map(mapProductsToGTM);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'view_item_list',
          ecommerce: {
            items: products
          }
        });
      });
    };

    function mapProductsToGTM(product) {
      return {
        item_name: product.productLang.name,
        item_id: product._id,
        price: product.discountPrice || product.priceTaxIncluded || product.price,
        item_brand: product.maker_id ? product.maker_id.name : '',
        item_category: product.category_id[0] ? product.category_id[0].categoryLang[0].name : '',
        quantity: '1'
      };
    }

    $('#categories-toggler').bind('mouseover', function () {
      $('#menu-categories').css('display', 'block');
      $('#cover').css('display', 'block');
    });

    $('#categories-toggler').bind('mouseout', function () {
      $('#menu-categories').css('display', 'none');
      $('#cover').css('display', 'none');
    });

    vm.searchProducts = function (id, parent, name) {
      vm.title = name;
      vm.id = id;
      vm.parent = parent;
      vm.page = 1;

      if (!parent) {
        vm.parent = undefined;
      }

      vm.getPage();
      $('#cover').css('display', 'none');
    };

    vm.getPage();

    vm.go = function (id) {
      if (vm.id && vm.id.length > 0) {
        const currentCategory = {
          _id: vm.id,
          parent: vm.parent,
          name: vm.title
        };

        localStorage.setItem('currentCategory', JSON.stringify(currentCategory));
      } else {
        localStorage.setItem('currentCategory', null);
      }

      $state.go('products.view-single', { productId: id });
    };
  }
})();
