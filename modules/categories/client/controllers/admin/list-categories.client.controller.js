(function () {
  'use strict';

  angular
    .module('categories')
    .filter('reverse', function () {
      return function (items) {
        return items ? items.slice().reverse() : null;
      };
    })
    .controller('CategoriesListController', CategoriesListController);

  CategoriesListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'categoriesResolve',
    'managerFileResolve',
    'CategoriesService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function CategoriesListController(
    $scope,
    $state,
    $window,
    categories,
    managerFile,
    CategoriesService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.categories = categories;
    vm.managerFile = managerFile;

    vm.remove = remove;
    vm.getChilds = getChilds;
    vm.listStatus = getStatus;

    vm.isEditing = false;
    vm.listShops = [];
    vm.listCategoriesParents = [];

    var initialParams = {
      lang: localStorage.getItem('NG_TRANSLATE_LANG_KEY'),
      page: 1,
      count: 10,
      populate: [
        {
          path: 'product_id shop',
          select: 'name name'
        },
        {
          path: 'managerFile_id',
          select: 'originalname path'
        }
      ],
      sorting: { order: 'asc' }
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return CategoriesService.get(params.parameters()).$promise.then(function (
          rstCategoriesService
        ) {
          if (rstCategoriesService.results.length > 0) {
            vm.categories.results = rstCategoriesService.results;
          }

          params.total(rstCategoriesService.total);
          return rstCategoriesService.results;
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

    // Remove existing Category
    function getChilds(parentId) {
      initialParams.filter = { parent: parentId };
      vm.tableParams = new NgTableParams(initialParams, initialSettings);
    }

    // Remove existing Category
    function remove(data) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.managerFile.removeAllFiles({ id: data.managerFile_id }, function (rstRemoveFile) {
          if (rstRemoveFile.error) {
            Notification.warning({
              message: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('SHOP.DELETED_FAIL')
            });
            return false;
          }
          vm.categories.removeItem(data._id, function (rst) {
            if (rst.error) {
              Notification.warning({
                message:
                  '<i class="fas fa-trash-alt"></i> ' + $translate.instant('LANG.DELETED_FAIL')
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
              message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('LANG.DELETED_OK')
            });
          });
        });
      }
    }
  }
})();
