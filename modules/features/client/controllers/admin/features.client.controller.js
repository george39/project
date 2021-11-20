(function () {
  'use strict';

  angular.module('features').controller('FeaturesController', FeaturesController);

  FeaturesController.$inject = [
    '$scope',
    '$state',
    '$window',
    'featureResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function FeaturesController(
    $scope,
    $state,
    $window,
    feature,
    Authentication,
    Notification,
    $translate
  ) {
    var vm = this;

    vm.feature = feature;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.listTypeFeatures = [];
    // vm.listShops = [];

    var optionsTypeFeatures = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeFeature' }
    };

    vm.feature.findAllTypeFeatures(optionsTypeFeatures, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listTypeFeatures.push({ _id: rst[item]._id, name: rst[item].nameLang });
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

    // vm.feature.findAllShops(optionsShops, function (rst) {
    //   if (rst.length > 0) {
    //     for (var item in rst) {
    //       if (!rst[item]._id) {
    //         continue;
    //       }
    //       vm.listShops.push({ _id: rst[item]._id, name: rst[item].name });
    //     }
    //   }
    // });

    // Remove existing Feature
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.feature.$remove(function () {
          $state.go('features.list');
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('FEATURE.DELETED_OK')
          });
        });
      }
    }

    // Save Feature
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.featureForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new feature, or update the current instance
      vm.feature.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('features.list'); // should we send the User to the list or the updated Feature's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('FEATURE.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('FEATURE.SAVED_FAIL')
        });
      }
    }
  }
})();
