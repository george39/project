(function () {
  'use strict';

  angular.module('favorites').controller('FavoritesController', FavoritesController);

  FavoritesController.$inject = [
    '$scope',
    '$state',
    '$window',
    'favoriteResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function FavoritesController($scope, $state, $window, favorite, Authentication, Notification, $translate) {
    var vm = this;

    vm.favorite = favorite;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

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

    vm.favorite.findAllUsers(optionsUsers, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listUsers.push({ _id: rst[item]._id, name: rst[item].name });
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

    vm.favorite.findAllProducts(optionsProducts, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listProducts.push({ _id: rst[item]._id, name: rst[item].name });
        }
      }
    });


    // Remove existing Favorite
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.favorite.$remove(function () {
          $state.go('favorites.list');
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('FAVORITE.DELETED_OK')
          });
        });
      }
    }

    // Save Favorite
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.favoriteForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (form) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new favorite, or update the current instance
      vm.favorite.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('favorites.list'); // should we send the User to the list or the updated Favorite's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('FAVORITE.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.error({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('FAVORITE.SAVED_FAIL')
        });
      }
    }
  }
})();
