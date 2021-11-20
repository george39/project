(function () {
  'use strict';

  angular.module('favorites').controller('FavoritesListController', FavoritesListController);

  FavoritesListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'favoritesResolve',
    'FavoritesService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function FavoritesListController(
    $scope,
    $state,
    $window,
    favorites,
    FavoritesService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.favorites = favorites;

    vm.listStatus = getStatus;
    vm.remove = remove;

    vm.isEditing = false;

    vm.listUsers = [];
    vm.listProducts = [];

    var optionsUsers = {
      field: ['name'],
      sort: {
        modified: 'desc'
      },
      filter: {},
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    vm.favorites.findAllUsers(optionsUsers, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listUsers.push({
            id: rst[item]._id,
            title: rst[item].name
          });
        }
      }
    });

    var optionsProducts = {
      field: ['name'],
      sort: {
        modified: 'desc'
      },
      filter: {},
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    vm.favorites.findAllProducts(optionsProducts, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listProducts.push({
            id: rst[item]._id,
            title: rst[item].name
          });
        }
      }
    });

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'user',
          select: 'name'
        },
        {
          path: 'product',
          select: 'name'
        }
      ]
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return FavoritesService.get(params.parameters()).$promise.then(function (
          rstFavoritesService
        ) {
          params.total(rstFavoritesService.total);
          return rstFavoritesService.results;
        });
      }
    };

    vm.tableParams = new NgTableParams(initialParams, initialSettings);

    function getStatus(field) {
      if (field === 'status') {
        return [
          { id: 0, title: 'Inactive' },
          { id: 1, title: 'Active' }
        ];
      }
    }

    // Remove existing Favorite
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.favorites.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.error({
              message: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('FAVORITE.DELETED_FAIL')
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
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('FAVORITE.DELETED_OK')
          });
        });
      }
    }
  }
})();
