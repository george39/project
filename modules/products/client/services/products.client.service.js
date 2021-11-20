// Products service used to communicate Products REST endpoints
(function () {
  'use strict';

  angular.module('products.services').factory('ProductsService', ProductsService);

  ProductsService.$inject = ['$resource', '$log', '$rootScope'];

  function ProductsService($resource, $log, $rootScope) {
    const Products = $resource(
      '/api/products/:productId',
      {
        productId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Products.prototype, {
      createOrUpdate: function () {
        const product = this;
        return createOrUpdate(product);
      },
      removeItem: function (id, callback) {
        const modules = $resource('/api/products/' + id);
        modules.remove(id, (rst) => {
          callback(rst);
        });
      },
      findAll: function (params, callback) {
        const modules = $resource('/api/products/findAll', params);
        modules.query({}, (rst) => {
          callback(rst);
        });
      },
      findAllCategories: function (params, callback) {
        params.lang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');
        const modules = $resource('/api/categories/findAll', params);
        modules.query({}, (rst) => {
          callback(rst);
        });
      },
      findAllLangs: function (params, callback) {
        const modules = $resource('/api/langs', params);
        modules.get({}, (rst) => {
          callback(rst);
        });
      },
      findAllManagerFiles: function (params, callback) {
        const modules = $resource('/api/managerFiles', params);
        modules.get({}, (rst) => {
          callback(rst);
        });
      },
      findAllTaxes: function (params, callback) {
        const modules = $resource('/api/taxes/findAll', params);
        modules.query({}, (rst) => {
          callback(rst);
        });
      },
      findAllThirdByType: function (params, callback) {
        const modules = $resource('/api/thirds/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllShops: function (params, callback) {
        const modules = $resource('/api/shops', params);
        modules.get({}, (rst) => {
          callback(rst);
        });
      },
      findAllShippers: function (params, callback) {
        const modules = $resource('/api/shippers/findAll', params);
        modules.query({}, (rst) => {
          callback(rst);
        });
      },
      findAllDiscountLists: function (params, callback) {
        const modules = $resource('/api/discountLists/findAll', params);
        modules.query({}, (rst) => {
          callback(rst);
        });
      },
      findAllDataTypesByDiscount: function (params, callback) {
        const modules = $resource('/api/dataTypes/findAll', params);
        modules.query({}, (rst) => {
          callback(rst);
        });
      },
      findAllFeatureDetails: function (params, callback) {
        const modules = $resource('/api/featureDetails/findAll', params);
        modules.query({}, (rst) => {
          callback(rst);
        });
      },
      findAllMoventsByProduct: function (params, callback) {
        const modules = $resource('/api/movements/findAll', params);
        modules.query({}, (rst) => {
          callback(rst);
        });
      },
      getTotalPrice: function (cart) {
        let totalPrice = 0;
        angular.forEach(cart, (item) => {
          // eslint-disable-next-line radix
          totalPrice += parseInt(item.price);
        });
        $rootScope.totalPrice = totalPrice;
        return totalPrice;
      },
      /**
       *
       * @param {object[]} cart
       * @returns {object[]}
       */
      appyDiscount: function (cart) {
        if (!cart) return [];
        if (!Array.isArray(cart)) cart = [cart];

        $rootScope.totalProducts = cart.reduce((accumulate, item, currentIndex, array) => {
          return item.quantity + accumulate;
        }, 0);

        if ($rootScope.totalProducts >= 10) {
          cart.forEach((item) => {
            if (!item.oldPrice) item.oldPrice = item.unitPrice;
            item.unitPrice = item.oldPrice - item.oldPrice * 0.12;
            item.price = item.unitPrice * item.quantity;
          });
        } else {
          cart.forEach((item) => {
            if (item.oldPrice) {
              item.unitPrice = item.oldPrice;
              delete item.oldPrice;
              item.price = item.unitPrice * item.quantity;
            }
          });
        }

        return cart;
      },
      getCart: function () {
        let cart = JSON.parse(localStorage.getItem('cart'));
        cart = this.appyDiscount(cart);
        this.getTotalPrice(cart);
        return cart;
      },
      processCart: function () {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const array = cart.map((item) => {
          return {
            product_id: item.product._id,
            combination_id: item.combination_id,
            quantity: item.quantity,
            price: item.price,
            unitPrice: item.unitPrice
          };
        });

        return array;
      },
      addToCart: function (data) {
        let cart = this.getCart();

        if (!cart) cart = [];

        if (!Array.isArray(cart)) cart = [cart];

        var category = data.product.category_id[0].categoryLang[0]
          ? data.product.category_id[0].categoryLang[0].name
          : '';

        const dataForGTM = {
          item_name: data.product.productLang.name, // Name or ID is required.
          item_id: data.product._id,
          price: data.unitPrice,
          item_brand: data.product.maker_id.name,
          item_category: category,
          item_variant: '',
          quantity: data.quantity
        };

        const dataForPixelFacebook = {
          content_name: data.product.productLang.name,
          content_category: data.product.category_id[0]._id,
          content_ids: [data.product._id],
          content_type: 'product',
          value: data.unitPrice,
          currency: 'COP'
        };

        window.fbq = window.fbq || function () {};
        window.fbq('track', 'ViewContent', dataForPixelFacebook);
        window.fbq('track', 'AddToCart', dataForPixelFacebook);

        cart.push(data);
        window.dataLayer = window.dataLayer || [];

        window.dataLayer.push({
          event: 'add_to_cart',
          ecommerce: {
            items: [dataForGTM]
          }
        });

        cart = this.appyDiscount(cart);

        this.getTotalPrice(cart);
        $rootScope.cart = cart;
        localStorage.setItem('cart', JSON.stringify(cart));
      },
      removeCart: function () {
        localStorage.removeItem('cart');
        this.getTotalPrice([]);
        $rootScope.cart = [];
      },
      removeCartItem: function (pos) {
        const data = $rootScope.cart[pos];

        // Función para GTM
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'remove_from_cart',
          ecommerce: {
            items: [
              {
                item_name: data.product.productLang.name, // Name or ID is required.
                item_id: data.product._id,
                price: data.unitPrice,
                item_brand: data.product.maker_id.name,
                item_category: data.product.category_id[0].categoryLang[0].name,
                item_variant: '',
                quantity: data.quantity
              }
            ]
          }
        });

        $rootScope.cart.splice(pos, 1);
        $rootScope.cart = this.appyDiscount($rootScope.cart);
        this.getTotalPrice($rootScope.cart);
        localStorage.setItem('cart', JSON.stringify($rootScope.cart));
      }
    });

    return Products;

    function createOrUpdate(product) {
      if (product._id) return product.$update(onSuccess, onError);
      else return product.$save(onSuccess, onError);

      // Handle successful response
      function onSuccess(product) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
})();
