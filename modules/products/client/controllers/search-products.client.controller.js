(function () {
  'use strict';

  angular.module('products').controller('SearchProductsController', SearchProductsController);

  SearchProductsController.$inject = ['$resource', '$stateParams', '$state'];

  function SearchProductsController($resource, $stateParams, $state) {
    var vm = this;
    vm.products = [];
    vm.page = 1;
    vm.totalPages = 1;

    vm.getPage = function () {
      vm.currentLang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');

      var params = {
        page: vm.page,
        count: 20,
        filter: {
          $and: processSearch($stateParams.query)
        },
        lang: vm.currentLang
      };

      var modules = $resource('/api/products/getProducts');
      modules.get(params, function (rst) {
        vm.totalPages = rst.pages;
        vm.products = rst.results;

        var products = vm.products.map(mapProductsToGTM);
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
        item_brand: product.maker_id.name,
        item_category: product.category_id[0].categoryLang[0].name,
        quantity: '1'
      };
    }

    vm.getPage();

    vm.go = function (id) {
      $state.go('products.view-single', { productId: id });
    };

    /**
     * @author Jonathan Correa
     *
     * @param {string} search contiene la busqueda a realizar, ejemplo: "Pantalones para dama"
     */
    function processSearch(search) {
      var exceptions = ['para', 'de', 'for', 'of', 'la', 'el'];
      var words = search.split('_');

      // Se almacenan solo las palabras clave
      var query = words.filter(function (item) {
        return !exceptions.includes(item);
      });

      var toFind = [];

      // Se hace una expresión regular para cada palabra
      query.forEach(function (word) {
        toFind.push({
          $or: [
            {
              'product.seo.metaKeywords': {
                $regex: word,
                $options: 'i'
              }
            },
            {
              'product.code': {
                $regex: word,
                $options: 'i'
              }
            }
          ]
        });
      });

      return toFind;
    }
  }
})();
