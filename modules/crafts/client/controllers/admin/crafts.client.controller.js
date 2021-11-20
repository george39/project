(function () {
  'use strict';

  angular.module('crafts').controller('CraftsAdminController', CraftsAdminController);

  CraftsAdminController.$inject = [
    '$scope',
    '$state',
    '$window',
    'craftResolve',
    'Authentication',
    'Notification',
    '$translate',
    'managerFileResolve',
    '$resource'
  ];

  function CraftsAdminController(
    $scope,
    $state,
    $window,
    craft,
    Authentication,
    Notification,
    $translate,
    managerFileResolve,
    $resource
  ) {
    var vm = this;

    vm.craft = craft;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.stepImages = [];
    vm.listProducts = [];
    vm.listCategories = [];
    var oldImage = null;

    if (vm.craft.image) {
      oldImage = vm.craft.image._id;
    }

    if (!vm.craft.steps) {
      vm.craft.steps = [];
    }

    $resource('/api/categories/crafts').query(
      {
        lang: localStorage.getItem('NG_TRANSLATE_LANG_KEY')
      },
      function (res) {
        if (res) {
          vm.listCategories = res;
        }
      }
    );

    if (vm.craft.materials) {
      var productIds = vm.craft.materials.map(function (product) {
        return product._id;
      });

      vm.craft.materials = productIds;
    }

    $(document).ready(function () {
      $('.multiple-select').select2();
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

    vm.craft.findAllProducts(optionsProducts, function (rst) {
      if (rst) {
        var currentLang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');

        angular.forEach(rst.results, function (item) {
          var lang = item.productLang.filter(function (language) {
            return language.lang_id.languageCode === currentLang;
          });

          vm.listProducts.push({
            _id: item._id,
            name: lang[0] ? lang[0].name : item.productLang[0].name
          });
        });
      }
    });

    vm.addStepImage = function (file, index) {
      var reader = new FileReader();
      reader.onload = function () {
        vm.stepImages.push(file[0]);
        vm.craft.steps[index].image = reader.result;
      };
      reader.readAsDataURL(file[file.length - 1]);
    };

    // Remove existing Craft
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.craft.$remove(function () {
          $state.go('crafts-admin.list');
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('CRAFT.DELETED_OK')
          });
        });
      }
    }

    vm.upload = function (files) {
      var reader = new FileReader();
      reader.onload = function () {
        vm.craft.image = reader.result;
      };
      reader.readAsDataURL(files[0]);
    };

    vm.removeImage = function (id) {
      if (id) {
        managerFileResolve.removeItem(id, function (rst) {
          if (rst) {
            vm.craft.image = null;
            vm.files = null;
          }
        });
      } else {
        vm.craft.image = null;
        vm.files = null;
      }
    };

    // Save Craft
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.craftForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      if (!vm.craft.image) {
        Notification.warning({ message: 'No has escogido ninguna imagen' });
        return false;
      } else if (vm.craft.image._id === oldImage) {
        createStepImages().then(function () {
          setTimeout(function () {
            vm.craft.createOrUpdate().then(successCallback).catch(errorCallback);
          }, 500);
        });
      } else {
        createStepImages().then(function () {
          managerFileResolve
            .createOrUpdateFile({
              id: vm.craft._id ? vm.files : false,
              files: vm.files,
              multiFiles: true
            })
            .then(function (params) {
              if (params[0]) {
                vm.craft.image = params[0].data._id;

                // Create a new craft, or update the current instance
                setTimeout(function () {
                  vm.craft.createOrUpdate().then(successCallback).catch(errorCallback);
                }, 500);
              }
            });
        });
      }

      function createStepImages() {
        return new Promise(function (resolve, reject) {
          if (vm.craft.steps.length > 0) {
            managerFileResolve
              .createOrUpdateFile({
                id: vm.craft._id ? vm.stepImages : false,
                files: vm.stepImages,
                multiFiles: true
              })
              .then(function (params) {
                if (params) {
                  var pos = 0;
                  angular.forEach(vm.craft.steps, function (item) {
                    if (!item.image._id) {
                      item.image = params[pos].data ? params[pos].data._id : null;
                      pos++;
                    }
                  });
                  resolve(true);
                }
              });
          }
          resolve(true);
        });
      }

      function successCallback(res) {
        $state.go('crafts-admin.list'); // should we send the User to the list or the updated Craft's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('CRAFT.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('CRAFT.SAVED_FAIL')
        });
      }
    }
  }
})();
