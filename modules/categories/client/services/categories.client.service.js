// Categories service used to communicate Categories REST endpoints
(function () {
  'use strict';

  angular.module('categories.services').factory('CategoriesService', CategoriesService);

  CategoriesService.$inject = ['$resource', '$log'];

  function CategoriesService($resource, $log) {
    var Categories = $resource(
      '/api/categories/:categoryId',
      {
        categoryId: '@_id'
      },
      {
        update: {
          method: 'PUT'
        }
      }
    );

    var currentCategory = {};

    angular.extend(Categories.prototype, {
      createOrUpdate: function () {
        var category = this;
        return createOrUpdate(category);
      },
      getCurrentCategory: function () {
        return currentCategory;
      },
      setCurrentCategory: function (category) {
        currentCategory = category;
      },
      removeItem: function (id, callback) {
        var modules = $resource('/api/categories/' + id);
        modules.remove(id, function (rst) {
          callback(rst);
        });
      },
      findAllLangs: function (params, callback) {
        var modules = $resource('/api/langs', params);
        modules.get({}, function (rst) {
          callback(rst);
        });
      },
      findAll: function (params, callback) {
        params.lang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');
        var modules = $resource('/api/categories/findAll', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      },
      findCategories: function (params, callback) {
        params.lang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');
        var modules = $resource('/api/categories/findCategories', params);
        modules.query({}, function (rst) {
          callback(rst);
        });
      }
    });

    return Categories;

    function createOrUpdate(category) {
      if (category._id) {
        return category.$update(onSuccess, onError);
      } else {
        return category.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(category) {
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
