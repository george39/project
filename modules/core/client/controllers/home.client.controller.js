(function () {
  'use strict';

  angular.module('core').controller('HomeController', HomeController);

  HomeController.$inject = ['$resource', '$state', 'newCategory', 'Notification', 'Authentication'];

  function HomeController($resource, $state, newCategory, Notification, Authentication) {
    var vm = this;
    vm.products = [];
    vm.offerProducts = [];
    vm.newCategory = newCategory;
    vm.currentLang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');
    vm.listCategories = [];
    vm.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    vm.categoriesSections = [];
    vm.toysCategory = null;
    vm.sampleImages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    vm.mustCompleteProfile = false;
    vm.mainImages = {};

    vm.goToCrafts = function () {
      $state.go('crafts.latest');
      setTimeout(function () {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
      }, 700);
    };

    const mainImages = [
      'left_image',
      'right_image',
      'middle_top_image',
      'middle_bottom_image',
      'images_collage'
    ];

    const paramsMainImages = {
      field: ['managerFiles', 'friendly'],
      populate: {
        path: 'managerFiles',
        select: 'path'
      },
      filter: {
        friendly: {
          $in: mainImages
        }
      }
    };

    $resource('/api/managerConfigurations').get(paramsMainImages, function (resp) {
      if (resp.results[0]) {
        for (let i = 0; i < resp.results.length; i++) {
          vm.mainImages[resp.results[i].friendly] = resp.results[i].managerFiles;
        }
      }
    });

    vm.newCategory.findAll(
      {
        lang: vm.currentLang,
        filter: {
          outstanding: true
        }
      },
      function (rst) {
        if (rst) {
          const categories = rst.filter(function (item) {
            return item.parent !== null;
          });

          vm.listCategories = categories;
        }
      }
    );

    vm.newCategory.findAll(
      {
        lang: vm.currentLang,
        filter: {
          $or: [
            {
              'categoryLang.name': {
                $regex: 'jugueteria',
                $options: 'i'
              }
            },
            {
              'categoryLang.name': {
                $regex: 'juguetería',
                $options: 'i'
              }
            }
          ]
        }
      },
      function (rst) {
        if (rst[0]) vm.toysCategory = rst[0];
      }
    );

    vm.getProducts = function (search) {
      const params = {
        page: 1,
        count: 8,
        sort: {
          _id: 1
        },
        filter: {},
        lang: vm.currentLang
      };

      params.filter[search] = true;

      var modules = $resource('/api/products/getProducts');
      modules.get(params, function (rst) {
        if (rst.results) {
          if (search === 'product.outstanding') vm.outstandingProducts = rst.results;
          if (search === 'product.isOffer') vm.offerProducts = rst.results;
        }
      });
    };

    vm.getProducts('product.outstanding');
    vm.getProducts('product.isOffer');

    vm.go = function (id) {
      $state.go('products.view-single', { productId: id });
    };

    vm.goCategories = function (category) {
      if (!category) return Notification.warning({ message: 'Esta categoría no existe' });
      vm.newCategory.setCurrentCategory(category);
      $state.go('listCategories');
    };

    $resource('/api/products/getSectionsByCategory').query({ lang: vm.currentLang }, function (
      res
    ) {
      if (res) {
        var numItems = 4;

        for (var i = 0; i < res.length; i++) {
          var obj = [];
          var pagesNum = Math.ceil(res[i].products.length / numItems);
          var cols = 0;
          var rows = 0;

          for (var k = 0; k < pagesNum; k++) {
            // En cada posición se crea un array que tendrá 4 posiciones, ya que el slider solo lleva 4 items.
            obj[k] = [];
          }

          for (var j = 0; j < res[i].products.length; j++) {
            if (cols === numItems) {
              rows++;
              cols = 0;
            }

            obj[rows].push(res[i].products[j]);
            cols++;
          }

          res[i].products = obj;
        }

        vm.categoriesSections = res;
      }
    });

    function validateProfile() {
      if (
        Authentication.user &&
        (!Authentication.user.DNI ||
          Authentication.user.DNI === '' ||
          !Authentication.user.phone ||
          Authentication.user.phone === '')
      ) {
        vm.mustCompleteProfile = true;
      }
    }

    $(document).ready(validateProfile);
  }
})();
