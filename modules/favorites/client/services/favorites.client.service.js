// Favorites service used to communicate Favorites REST endpoints
(function () {
  'use strict';

  angular.module('favorites.services').factory('FavoritesService', FavoritesService);

  FavoritesService.$inject = ['$resource', '$log'];

  function FavoritesService($resource, $log) {
    var Favorites = $resource(
      '/api/favorites/:favoriteId',
      {
        favoriteId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    angular.extend(Favorites.prototype, {
      createOrUpdate: function () {
        var favorite = this;
        return createOrUpdate(favorite);
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/favorites/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllUsers: function (params, callback) {
        var modules = $resource('/api/users/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findAllProducts: function (params, callback) {
        var modules = $resource('/api/products/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      }
    });

    return Favorites;

    function createOrUpdate(favorite) {
      if (favorite._id) {
        return favorite.$update(onSuccess, onError);
      } else {
        return favorite.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(favorite) {
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
