(function () {
  'use strict';

  angular.module('favorites.routes').config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('favorites', {
        abstract: true,
        url: '/favorites',
        template: '<ui-view/>'
      })
      .state('favorites.list', {
        url: '',
        templateUrl: '/modules/favorites/client/views/admin/list-favorites.client.view.html',
        controller: 'FavoritesListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          favoritesResolve: getFavorites
        }
      })
      .state('favorites.create', {
        url: '/create',
        templateUrl: '/modules/favorites/client/views/admin/form-favorite.client.view.html',
        controller: 'FavoritesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          favoriteResolve: newFavorite
        }
      })
      .state('favorites.edit', {
        url: '/:favoriteId/edit',
        templateUrl: '/modules/favorites/client/views/admin/form-favorite.client.view.html',
        controller: 'FavoritesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ favoriteResolve.title }}'
        },
        resolve: {
          favoriteResolve: getFavorite
        }
      })
      .state('favorites.view', {
        url: '/:favoriteId',
        templateUrl: '/modules/favorites/client/views/admin/view-favorite.client.view.html',
        controller: 'FavoritesController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ favoriteResolve.title }}'
        },
        resolve: {
          favoriteResolve: getFavorite
        }
      });
  }

  getFavorite.$inject = ['$stateParams', 'FavoritesService'];

  function getFavorite($stateParams, FavoritesService) {
    return FavoritesService.get({
      favoriteId: $stateParams.favoriteId
    }).$promise;
  }

  getFavorites.$inject = ['$stateParams', 'FavoritesService'];

  function getFavorites($stateParams, FavoritesService) {
    var filterFavoritesService = {
      count: 5,
      page: 1,
      populate: {
        path: 'user',
        field: 'displayName'
      },
      filter: {},
      field: ''
    };
    return FavoritesService.get(filterFavoritesService).$promise;
  }

  newFavorite.$inject = ['FavoritesService'];

  function newFavorite(FavoritesService) {
    return new FavoritesService();
  }
})();
