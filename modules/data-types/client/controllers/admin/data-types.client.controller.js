(function () {
  'use strict';

  angular.module('dataTypes').controller('DataTypesController', DataTypesController);

  DataTypesController.$inject = [
    '$scope',
    '$state',
    '$window',
    'dataTypeResolve',
    'Authentication',
    'Notification',
    '$translate'
  ];

  function DataTypesController(
    $scope,
    $state,
    $window,
    dataType,
    Authentication,
    Notification,
    $translate
  ) {
    var vm = this;

    vm.dataType = dataType;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.listAliases = [];
    // vm.listShops = [];

    var optionsAliases = {
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

    vm.dataType.findAllAliases(optionsAliases, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listAliases.push({ _id: rst[item]._id, name: rst[item].nameLang });
        }
      }
    });

    // Remove existing Data type
    function remove() {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.dataType.$remove(function () {
          $state.go('dataTypes.list');
          Notification.success({
            message:
              '<i class="far fa-thumbs-up"></i> ' + $translate.instant('DATA_TYPE.DELETED_OK')
          });
        });
      }
    }

    // Save Data type
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.dataTypeForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new dataType, or update the current instance
      vm.dataType.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('dataTypes.list'); // should we send the User to the list or the updated Data type's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('DATA_TYPE.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('DATA_TYPE.SAVED_FAIL')
        });
      }
    }
  }
})();
