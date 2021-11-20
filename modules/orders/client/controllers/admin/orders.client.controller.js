(function () {
  'use strict';

  angular.module('orders').controller('OrdersController', OrdersController);

  OrdersController.$inject = ['orderResolve', '$resource', '$stateParams'];

  function OrdersController(order, $resource, $stateParams) {
    const vm = this;
    vm.listStatus = {};
    vm.historyOrder = [];
    vm.form = {};
    vm.addStatus = false;
    vm.status = {
      order_id: $stateParams.orderId
    };

    const params = {
      filter: {
        lang: localStorage.getItem('NG_TRANSLATE_LANG_KEY')
      },
      populate: {
        path: 'user_id',
        select: 'displayName phone DNI'
      }
    };

    order.getOrder($stateParams.orderId, params, function (order) {
      vm.order = order;
    });

    const historyParams = {
      filter: {
        order_id: $stateParams.orderId
      }
    };

    const modules = $resource('/api/historyOrders');
    modules.query(historyParams, function (res) {
      vm.historyOrder = res;
    });

    const optionsTypeValueDiscount = {
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'purchaseStatus' }
    };

    const status = $resource('/api/dataTypes/findAll', optionsTypeValueDiscount);
    status.query({}, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listStatus[rst[item]._id] = rst[item].nameLang;
        }
      }
    });

    function clearForm() {
      vm.status.message = '';
      vm.status.status = '';
    }

    vm.createStatus = function (isValid) {
      if (isValid) {
        const Status = $resource('/api/historyOrders');
        const newStatus = new Status(vm.status);
        newStatus.$save().then(function (res) {
          vm.historyOrder.push(res);
          clearForm();
        });
      }
    };
  }
})();
