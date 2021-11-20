(function () {
  'use strict';

  angular.module('categories.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('categories', {
        abstract: true,
        url: '/categories',
        template: '<ui-view/>'
      })
      .state('categories.list', {
        url: '',
        templateUrl: '/modules/categories/client/views/admin/list-categories.client.view.html',
        controller: 'CategoriesListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          categoriesResolve: getCategories,
          managerFileResolve: newManagerFile
        }
      })
      .state('categories.create', {
        url: '/create',
        templateUrl: '/modules/categories/client/views/admin/form-category.client.view.html',
        controller: 'CategoriesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          categoryResolve: newCategory,
          managerFileResolve: newManagerFile
        }
      })
      .state('categories.edit', {
        url: '/:categoryId/edit',
        templateUrl: '/modules/categories/client/views/admin/form-category.client.view.html',
        controller: 'CategoriesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ categoryResolve.title }}'
        },
        resolve: {
          categoryResolve: getCategory,
          managerFileResolve: newManagerFile
        }
      })
      .state('categories.view', {
        url: '/:categoryId',
        templateUrl: '/modules/categories/client/views/admin/view-category.client.view.html',
        controller: 'CategoriesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ categoryResolve.title }}'
        },
        resolve: {
          categoryResolve: getCategory,
          managerFileResolve: newManagerFile
        }
      });
  }

  getCategory.$inject = ['$stateParams', 'CategoriesService'];

  function getCategory($stateParams, CategoriesService) {
    return CategoriesService.get({
      categoryId: $stateParams.categoryId
    }).$promise;
  }

  getCategories.$inject = ['$stateParams', 'CategoriesService'];

  function getCategories($stateParams, CategoriesService) {
    var filterCategoriesService = {
      lang: localStorage.getItem('NG_TRANSLATE_LANG_KEY'),
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return CategoriesService.get(filterCategoriesService).$promise;
  }

  newCategory.$inject = ['CategoriesService'];

  function newCategory(CategoriesService) {
    return new CategoriesService();
  }

  newProductService.$inject = ['ProductsService'];

  function newProductService(ProductsService) {
    return new ProductsService();
  }

  newManagerFile.$inject = ['ManagerFilesService'];

  function newManagerFile(ManagerFilesService) {
    return new ManagerFilesService();
  }
})();
