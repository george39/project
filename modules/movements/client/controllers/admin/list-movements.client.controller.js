(function () {
  'use strict';

  angular.module('movements').controller('MovementsListController', MovementsListController);

  MovementsListController.$inject = [
    '$window',
    'movementsResolve',
    'MovementsService',
    'NgTableParams',
    'Notification',
    '$translate'
  ];

  function MovementsListController(
    $window,
    movements,
    MovementsService,
    NgTableParams,
    Notification,
    $translate
  ) {
    // debugger;
    var vm = this;
    vm.movements = movements;

    vm.listStatus = getStatus;
    vm.remove = remove;

    vm.isEditing = false;

    vm.listProducts = [];
    vm.listFeatureDetails = [];
    vm.listTypeMovements = [];
    vm.listOrders = [];

    var optionsProducts = {
      field: ['productLang'],
      sort: {
        modified: 'desc'
      },
      lang: localStorage.getItem('NG_TRANSLATE_LANG_KEY'),
      filter: {},
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    vm.movements.findAllProducts(optionsProducts, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }

          vm.listProducts.push({
            id: rst[item]._id,
            title: rst[item].productLang[0].name
          });
        }
      }
    });

    var optionsFeatureDetails = {
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

    vm.movements.findAllFeatureDetails(optionsFeatureDetails, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listFeatureDetails.push({
            id: rst[item]._id,
            title: rst[item].nameLang
          });
        }
      }
    });

    var optionsTypeMovements = {
      field: ['name'],
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeMovement' },
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    vm.movements.findAllTypeMovements(optionsTypeMovements, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listTypeMovements.push({
            id: rst[item]._id,
            title: rst[item].nameLang
          });
        }
      }
    });

    var optionsOrders = {
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

    vm.movements.findAllOrders(optionsOrders, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listOrders.push({
            id: rst[item]._id,
            title: rst[item].name
          });
        }
      }
    });

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'product_id',
          select: 'name'
        },
        {
          path: 'featureDetail_id',
          select: 'name'
        },
        {
          path: 'typeMovement_id',
          select: 'name'
        },
        {
          path: 'order_id',
          select: 'name'
        },
        {
          path: 'shop',
          select: 'name'
        }
      ]
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return MovementsService.get(params.parameters()).$promise.then(function (
          rstMovementsService
        ) {
          params.total(rstMovementsService.total);
          return rstMovementsService.results;
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

    // Remove existing Movement
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.movements.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('MOVEMENT.DELETED_FAIL')
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
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('MOVEMENT.DELETED_OK')
          });
        });
      }
    }
  }
})();
