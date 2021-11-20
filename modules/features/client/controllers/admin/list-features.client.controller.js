(function () {
  'use strict';

  angular.module('features').controller('FeaturesListController', FeaturesListController);

  FeaturesListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'featuresResolve',
    'FeaturesService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function FeaturesListController(
    $scope,
    $state,
    $window,
    features,
    FeaturesService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.features = features;

    vm.listStatus = getStatus;
    vm.remove = remove;

    vm.isEditing = false;

    vm.listTypeFeatures = [];
    // vm.listShops = [];

    var optionsTypeFeatures = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeFeature' }
    };

    vm.features.findAllTypeFeatures(optionsTypeFeatures, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listTypeFeatures.push({
            id: rst[item]._id,
            title: $translate.instant('FEATURE.' + rst[item].nameLang.toUpperCase())
          });
        }
      }
    });

    // var optionsShops = {
    //   field: ['name'],
    //   sort: {
    //     modified: 'desc'
    //   },
    //   filter: {},
    //   populate: [
    //     {
    //       path: '',
    //       select: ''
    //     }
    //   ]
    // };

    // vm.features.findAllShops(optionsShops, function (rst) {
    //   if (rst.length > 0) {
    //     for (var item in rst) {
    //       if (!rst[item]._id) {
    //         continue;
    //       }
    //       vm.listShops.push({
    //         id: rst[item]._id,
    //         title: rst[item].name
    //       });
    //     }
    //   }
    // });

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'typeFeature_id',
          select: 'nameLang'
        },
        {
          path: 'shop',
          select: 'name'
        }
      ],
      sorting: ['order']
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return FeaturesService.get(params.parameters()).$promise.then(function (
          rstFeaturesService
        ) {
          params.total(rstFeaturesService.total);
          return rstFeaturesService.results;
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

    // Remove existing Feature
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.features.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('FEATURE.DELETED_FAIL')
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
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('FEATURE.DELETED_OK')
          });
        });
      }
    }
  }
})();
