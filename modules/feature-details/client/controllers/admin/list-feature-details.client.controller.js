(function () {
  'use strict';

  angular
    .module('featureDetails')
    .controller('FeatureDetailsListController', FeatureDetailsListController);

  FeatureDetailsListController.$inject = [
    '$scope',
    '$state',
    '$window',
    'featureDetailsResolve',
    'FeatureDetailsService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function FeatureDetailsListController(
    $scope,
    $state,
    $window,
    featureDetails,
    FeatureDetailsService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.featureDetails = featureDetails;

    vm.listStatus = getStatus;
    vm.remove = remove;

    vm.isEditing = false;

    vm.listFeatures = [];
    // vm.listShops = [];

    var optionsFeatures = {
      field: ['nameLang'],
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

    vm.featureDetails.findAllFeatures(optionsFeatures, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listFeatures.push({
            id: rst[item]._id,
            title: rst[item].nameLang
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

    // vm.featureDetails.findAllShops(optionsShops, function (rst) {
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
          path: 'feature_id',
          select: 'nameLang'
        },
        {
          path: 'shop',
          select: 'name'
        }
      ],
      sorting: ['feature_id', 'order']
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return FeatureDetailsService.get(params.parameters()).$promise.then(function (
          rstFeatureDetailsService
        ) {
          params.total(rstFeatureDetailsService.total);
          return rstFeatureDetailsService.results;
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

    // Remove existing Feature Detail
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.featureDetails.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' +
                $translate.instant('FEATURE_DETAIL.DELETED_FAIL')
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
            message:
              '<i class="far fa-thumbs-up"></i> ' + $translate.instant('FEATURE_DETAIL.DELETED_OK')
          });
        });
      }
    }
  }
})();
