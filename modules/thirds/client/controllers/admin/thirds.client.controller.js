(function () {
  'use strict';

  angular.module('thirds').controller('ThirdsController', ThirdsController);

  ThirdsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'thirdResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function ThirdsController(
    $scope,
    $state,
    $window,
    third,
    Authentication,
    Notification,
    $translate
  ) {
    var vm = this;

    vm.third = third;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.listTypeThirds = [];
    vm.listTypeDocuments = [];

    var optionsTypeThirds = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeThird' }
    };

    vm.third.findAllDataTypesByAlias(optionsTypeThirds, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listTypeThirds.push({ _id: rst[item]._id, name: rst[item].nameLang });
        }
      }
    });

    var optionsTypeDocuments = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeDocument' }
    };

    vm.third.findAllDataTypesByAlias(optionsTypeDocuments, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listTypeDocuments.push({ _id: rst[item]._id, name: rst[item].nameLang });
        }
      }
    });

    var optionsShops = {
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

    vm.third.findAllShops(optionsShops, function (rst) {
      if (rst) {
        vm.listShops = rst.results;
      }
    });

    // Remove existing Third
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.third.$remove(function () {
          $state.go('thirds.list');
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('THIRD.DELETED_OK')
          });
        });
      }
    }

    // Save Third
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.thirdForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new third, or update the current instance
      vm.third.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('thirds.list'); // should we send the User to the list or the updated Third's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('THIRD.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('THIRD.SAVED_FAIL')
        });
      }
    }
  }
})();
