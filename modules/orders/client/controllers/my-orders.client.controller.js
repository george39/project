(function () {
  'use strict';

  angular.module('orders').controller('MyOrdersController', MyOrdersController);

  MyOrdersController.$inject = [
    '$scope',
    '$state',
    '$window',
    'ordersResolve',
    'OrdersService',
    'Notification',
    '$translate',
    '$resource',
    'managerFileResolve',
    'orderResolve'
  ];

  function MyOrdersController(
    $scope,
    $state,
    $window,
    orders,
    OrdersService,
    Notification,
    $translate,
    $resource,
    managerFileResolve,
    orderResolve
  ) {
    // debugger;
    var vm = this;
    vm.historyOrders = orders;
    var _orderResolve = orderResolve;
    var chipBlue = {
      color: 'white',
      background: '#34a4eb'
    };

    var chipRed = {
      color: 'white',
      background: '#f74f4f'
    };

    var chipGreen = {
      color: 'white',
      background: '#5de364'
    };

    vm.paymentReceipt = {};
    vm.statusColor = {
      // BLUE
      'pendiente por pago': chipBlue,
      envíado: chipBlue,
      'comprobante subido': chipBlue,
      'preparación en curso': chipBlue,
      // RED
      'error en pago': chipRed,
      cancelado: chipRed,
      'pendiente por comprobante': chipRed,
      // GREEN
      'pago aceptado': chipGreen,
      entregado: chipGreen
    };

    vm.uploadPaymentReceipt = function (file, orderId) {
      vm.paymentReceipt[orderId] = file;
    };

    vm.uploadImage = function (orderId) {
      managerFileResolve
        .createOrUpdateFile({
          id: false,
          files: vm.paymentReceipt[orderId],
          multiFiles: false
        })
        .then(function (params) {
          if (params[0]) {
            _orderResolve._id = orderId;
            _orderResolve.paymentReceipt = params[0].data._id;

            _orderResolve
              .createOrUpdate()
              .then(function (res) {
                if (res) {
                  var buttons = document.querySelectorAll('.i' + orderId);
                  for (var i = 0; i < buttons.length; i++) {
                    buttons[i].style.display = 'none';
                  }

                  Notification.success({
                    message: 'Imagen subida correctamente'
                  });
                }
              })
              .catch(function (err) {
                console.error(err);
              });
          }
        })
        .catch(function (err) {
          Notification.warning({
            message: 'Un error ha ocurrido, intentelo de nuevo por favor'
          });
          return;
        });
    };

    vm.removeImage = function (orderId) {
      delete vm.paymentReceipt[orderId];
    };
  }
})();
