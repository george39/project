(function () {
  'use strict';

  angular.module('featureDetails').controller('FeatureDetailsController', FeatureDetailsController);

  FeatureDetailsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'featureDetailResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function FeatureDetailsController(
    $scope,
    $state,
    $window,
    featureDetail,
    Authentication,
    Notification,
    $translate
  ) {
    var vm = this;

    vm.featureDetail = featureDetail;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

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

    vm.featureDetail.findAllFeatures(optionsFeatures, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listFeatures.push({ _id: rst[item]._id, name: rst[item].nameLang });
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

    // vm.featureDetail.findAllShops(optionsShops, function (rst) {
    //   if (rst.length > 0) {
    //     for (var item in rst) {
    //       if (!rst[item]._id) {
    //         continue;
    //       }
    //       vm.listShops.push({ _id: rst[item]._id, name: rst[item].name });
    //     }
    //   }
    // });

    // Remove existing Feature detail
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.featureDetail.$remove(function () {
          $state.go('featureDetails.list');
          Notification.success({
            message:
              '<i class="far fa-thumbs-up"></i> ' + $translate.instant('FEATURE_DETAIL.DELETED_OK')
          });
        });
      }
    }

    // Save Feature detail
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.featureDetailForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new featureDetail, or update the current instance
      vm.featureDetail.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('featureDetails.list'); // should we send the User to the list or the updated Feature detail's view?
        Notification.success({
          message:
            '<i class="far fa-thumbs-up"></i> ' + $translate.instant('FEATURE_DETAIL.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title:
            '<i class="fas fa-trash-alt"></i> ' + $translate.instant('FEATURE_DETAIL.SAVED_FAIL')
        });
      }
    }
  }
})();
