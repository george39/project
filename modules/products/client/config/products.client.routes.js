(function () {
  'use strict';

  angular.module('products.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('products', {
        abstract: true,
        url: '/products',
        template: '<ui-view/>'
      })
      .state('products.list', {
        url: '',
        templateUrl: '/modules/products/client/views/admin/list-products.client.view.html',
        controller: 'ProductsListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          productsResolve: getProducts,
          managerFileResolve: newManagerFile
        }
      })
      .state('products.create', {
        url: '/create',
        templateUrl: '/modules/products/client/views/admin/form-product.client.view.html',
        controller: 'ProductsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          productResolve: newProduct,
          managerFileResolve: newManagerFile
        }
      })
      .state('products.create.basic', {
        url: '/basic',
        templateUrl: '/modules/products/client/views/admin/basic-form-product.client.view.html',
        controller: 'ProductsBasicController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('products.edit', {
        url: '/:productId/edit',
        templateUrl: '/modules/products/client/views/admin/form-product.client.view.html',
        controller: 'ProductsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ productResolve.title }}'
        },
        resolve: {
          productResolve: getProduct,
          managerFileResolve: newManagerFile
        }
      })
      .state('products.edit.basic', {
        url: '/basic',
        templateUrl: '/modules/products/client/views/admin/basic-form-product.client.view.html',
        controller: 'ProductsBasicController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('products.edit.quantity', {
        url: '/quantity',
        templateUrl: '/modules/products/client/views/admin/quantity-form-product.client.view.html',
        controller: 'ProductsQuantityController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('products.edit.combinationPicture', {
        url: '/combination/:index',
        templateUrl: '/modules/products/client/views/admin/combination-product.client.view.html',
        controller: 'CombinationPictureController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          managerFileResolve: newManagerFile
        }
      })
      .state('products.edit.transport', {
        url: '/transport',
        templateUrl: '/modules/products/client/views/admin/transport-form-product.client.view.html',
        controller: 'ProductsTransportController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('products.edit.price', {
        url: '/price',
        templateUrl: '/modules/products/client/views/admin/price-form-product.client.view.html',
        controller: 'ProductsPriceController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('products.edit.seo', {
        url: '/seo',
        templateUrl: '/modules/products/client/views/admin/seo-form-product.client.view.html',
        controller: 'ProductsSeoController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('products.edit.options', {
        url: '/options',
        templateUrl: '/modules/products/client/views/admin/options-form-product.client.view.html',
        controller: 'ProductsOptionsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('products.view', {
        url: '/:productId',
        templateUrl: '/modules/products/client/views/admin/view-product.client.view.html',
        controller: 'ProductsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ productResolve.title }}'
        },
        resolve: {
          productResolve: getProduct,
          productService: newProduct,
          managerFileResolve: newManagerFile
        }
      })
      .state('products.view-single', {
        url: '/view/:productId',
        templateUrl: '/modules/products/client/views/products-view.client.view.html',
        controller: 'ProductsViewController',
        css: '/modules/products/client/css/product-view.css',
        controllerAs: 'vm',
        data: {
          roles: ['']
        },
        resolve: {
          productResolve: getProduct,
          productService: newProduct,
          managerFileResolve: newManagerFile,
          newMovement: newMovement
        }
      });
  }

  getProduct.$inject = ['$stateParams', 'ProductsService'];

  function getProduct($stateParams, ProductsService) {
    return ProductsService.get({
      productId: $stateParams.productId
    }).$promise;
  }

  getProducts.$inject = ['$stateParams', 'ProductsService'];

  function getProducts($stateParams, ProductsService) {
    var filterProductsService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return ProductsService.get(filterProductsService).$promise;
  }

  newProduct.$inject = ['ProductsService'];

  function newProduct(ProductsService) {
    return new ProductsService();
  }

  newMovement.$inject = ['MovementsService'];

  function newMovement(MovementsService) {
    return new MovementsService();
  }

  newManagerFile.$inject = ['ManagerFilesService'];

  function newManagerFile(ManagerFilesService) {
    return new ManagerFilesService();
  }
})();
