(function () {
  'use strict';

  angular.module('core.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function ($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';

      if (hasTrailingSlash) {
        // if last character is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        $location.replace().path(newPath);
      }
    });

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/modules/core/client/views/home.client.view.html',
        controller: 'HomeController',
        controllerAs: 'vm',
        css: '/modules/core/client/css/home.css',
        resolve: {
          newCategory: newCategory
        }
      })
      .state('listCategories', {
        url: '/listCategories',
        templateUrl: '/modules/categories/client/views/list-categories.client.view.html',
        controller: 'CategoriesListClientController',
        controllerAs: 'vm',
        css: '/modules/categories/client/css/categories.css',
        data: {
          roles: ['guest']
        },
        resolve: {
          newCategory: newCategory
        }
      })
      .state('whoWeAre', {
        url: '/whoWeAre',
        templateUrl: '/modules/core/client/views/who-we-are.client.view.html',
        controller: 'WhoWeAreController',
        controllerAs: 'vm',
        // css: '/modules/categories/client/css/categories.css',
        data: {
          roles: ['guest']
        },
        resolve: {}
      })
      .state('workWithUs', {
        url: '/workWithUs',
        templateUrl: '/modules/core/client/views/work-with-us.client.view.html',
        controller: 'WorkWithUsController',
        controllerAs: 'vm',
        data: {
          roles: ['guest']
        },
        resolve: {}
      })
      .state('thankYouPage', {
        url: '/thankyou',
        templateUrl: '/modules/core/client/views/thank-you-page.client.view.html',
        controller: 'ThankYouController',
        controllerAs: 'vm',
        data: {
          roles: ['guest']
        },
        resolve: {
          productService: newProduct
        }
      })
      .state('search-products', {
        url: '/search/:query',
        templateUrl: '/modules/products/client/views/search-products.client.view.html',
        controller: 'SearchProductsController',
        controllerAs: 'vm',
        css: '/modules/categories/client/css/categories.css',
        data: {
          roles: ['']
        }
      })
      .state('products.cart', {
        url: '/cart',
        templateUrl: '/modules/products/client/views/cart.client.view.html',
        controller: 'CartsController',
        controllerAs: 'vm',
        data: {
          roles: ['']
        },
        css: '/modules/products/client/css/cart.css',
        resolve: {
          productService: newProduct,
          managerFileResolve: newManagerFile
        }
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: '/modules/core/client/views/404.client.view.html',
        controller: 'ErrorController',
        controllerAs: 'vm',
        params: {
          message: function ($stateParams) {
            return $stateParams.message;
          }
        },
        data: {
          ignoreState: true
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: '/modules/core/client/views/400.client.view.html',
        controller: 'ErrorController',
        controllerAs: 'vm',
        params: {
          message: function ($stateParams) {
            return $stateParams.message;
          }
        },
        data: {
          ignoreState: true
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: '/modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true
        }
      });
  }

  newCategory.$inject = ['CategoriesService'];

  function newCategory(CategoriesService) {
    return new CategoriesService();
  }

  newManagerFile.$inject = ['ManagerFilesService'];

  function newManagerFile(ManagerFilesService) {
    return new ManagerFilesService();
  }

  newProduct.$inject = ['ProductsService'];

  function newProduct(ProductsService) {
    return new ProductsService();
  }

  getProduct.$inject = ['$stateParams', 'ProductsService'];

  function getProduct($stateParams, ProductsService) {
    return ProductsService.get({
      productId: $stateParams.productId
    }).$promise;
  }
})();
