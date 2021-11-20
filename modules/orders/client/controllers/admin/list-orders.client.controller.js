(function () {
  'use strict';

  angular.module('orders').controller('OrdersListController', OrdersListController);

  OrdersListController.$inject = [
    '$window',
    'ordersResolve',
    'OrdersService',
    'NgTableParams',
    'Notification',
    '$translate',
    '$resource'
  ];

  function OrdersListController(
    $window,
    orders,
    OrdersService,
    NgTableParams,
    Notification,
    $translate,
    $resource
  ) {
    var vm = this;
    vm.orders = orders;

    vm.listStatus = getStatus;
    vm.remove = remove;

    vm.isEditing = false;

    vm.listProductos = [];
    vm.listShippers = [];
    vm.listUsers = [];
    vm.paymentMethods = [];
    vm.status = [];

    var chipBlue = {
      color: 'white',
      background: '#34a4eb'
    };

    var chipRed = {
      color: 'white',
      background: '#fc5d5d'
    };

    var chipGreen = {
      color: 'white',
      background: '#5de364'
    };

    vm.statusColor = {
      // BLUE
      'pendiente por pago': chipBlue,
      'comprobante subido': chipBlue,
      envíado: chipBlue,
      'preparación en curso': chipBlue,
      // RED
      'error en pago': chipRed,
      cancelado: chipRed,
      'pendiente por comprobante': chipRed,
      // GREEN
      'pago aceptado': chipGreen,
      entregado: chipGreen
    };

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

    vm.orders.findAllProductos(optionsProducts, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) continue;

          vm.listProductos.push({
            id: rst[item]._id,
            title: rst[item].name
          });
        }
      }
    });

    var optionsPaymentMethods = {
      sort: {
        modified: 'desc'
      },
      filter: {
        'alias_id.nameLang': 'Estado de compra'
      }
    };

    $resource('/api/dataTypes/findAll', optionsPaymentMethods).query(function (res) {
      if (res.length > 0) {
        for (var i = 0; i < res.length; i++) {
          vm.status.push({
            id: res[i]._id,
            title: res[i].nameLang
          });
        }
      }
    });

    var optionsShippers = {
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

    vm.orders.findAllShippers(optionsShippers, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) continue;

          vm.listShippers.push({
            id: rst[item]._id,
            title: rst[item].third_id ? rst[item].third_id.name : 'Sin nombre'
          });
        }
      }
    });

    var initialParams = {
      page: 1,
      count: 10,
      populate: [
        {
          path: 'user_id',
          select: 'displayName addresses phone'
        },
        {
          path: 'shop',
          select: 'name'
        },
        {
          path: 'status',
          select: 'nameLang'
        },
        {
          path: 'payType',
          select: 'nameLang'
        },
        {
          path: 'shipper_id',
          model: 'Shipper',
          populate: {
            path: 'third_id',
            select: 'name'
          }
        }
      ]
    };

    var initialSettings = {
      counts: [],
      getData: function (params) {
        return OrdersService.get(params.parameters()).$promise.then(function (rstOrdersService) {
          params.total(rstOrdersService.total);
          return rstOrdersService.results;
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

    // Remove existing Order
    function remove(id) {
      if ($window.confirm($translate.instant('GLOBAL.ISDELETE'))) {
        vm.orders.removeItem(id, function (rst) {
          if (rst.error) {
            Notification.warning({
              message:
                '<i class="fas fa-trash-alt"></i> ' + $translate.instant('ORDER.DELETED_FAIL')
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
            message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('ORDER.DELETED_OK')
          });
        });
      }
    }

    var optionsPaymentMethods2 = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'paymentMethod' }
    };

    var modules = $resource('/api/dataTypes/findAll', optionsPaymentMethods2);
    modules.query({}, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) continue;

          vm.paymentMethods.push({
            title: rst[item].nameLang,
            id: rst[item]._id
          });
        }
      }
    });
  }
})();
