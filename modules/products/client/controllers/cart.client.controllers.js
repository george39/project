(function () {
  'use strict';

  angular.module('products').controller('CartsController', CartsController);

  CartsController.$inject = [
    '$rootScope',
    '$resource',
    'productService',
    '$scope',
    'Authentication',
    'UsersService',
    'Notification',
    '$translate',
    'OrdersService',
    'managerFileResolve'
  ];

  function CartsController(
    $rootScope,
    $resource,
    productsService,
    $scope,
    Authentication,
    UsersService,
    Notification,
    $translate,
    OrdersService,
    managerFileResolve
  ) {
    var vm = this;
    vm.zones = [
      { label: 'urbana (Pereira)', value: 'urbana' },
      { label: 'regional (Eje cafetero)', value: 'regional' },
      { label: 'nacional (Resto del país)', value: 'nacional' }
    ];
    vm.products = [];
    vm.signin = {};
    vm.signup = {};
    vm.address = {};
    vm.order = {
      products: productsService.processCart()
    };
    vm.addressForm = {};
    vm.authentication = Authentication;
    vm.productsService = productsService;
    vm.shippers = [];
    vm.paymentMethods = {};

    vm.showAddressForm = false;
    vm.shippingPrice = getShippingPrice();

    function getShippingPrice() {
      if ($rootScope.totalPrice === 0) return 0;
      if (
        vm.authentication.user &&
        vm.authentication.user.addresses &&
        Array.isArray(vm.authentication.user.addresses)
      ) {
        var addresses = vm.authentication.user.addresses;
        var activeAddress = addresses.filter(function (address) {
          return address.isDefaultAddress;
        });

        activeAddress = activeAddress[0] || {};

        if (activeAddress.zone === 'urbana') return 5800;
        if (activeAddress.zone === 'regional') return 8200;
        if (activeAddress.zone === 'nacional') return 10400;

        return 5800;
      } else {
        return 5800;
      }
    }

    function findShippers() {
      $resource('/api/shippers/findAll').query({}, function (res) {
        vm.shippers = res;
      });
    }

    function findPaymentMethods() {
      var optionsPaymentMethods = {
        sort: {
          modified: 'desc'
        },
        filter: { 'alias_id.systemName': 'paymentMethod' }
      };

      var src = $resource('/api/dataTypes/findAll', optionsPaymentMethods);
      src.query({}, function (rst) {
        if (rst.length > 0) {
          vm.order.payType = rst[0]._id; // VALOR POR DEFECTO

          for (var item in rst) {
            if (!rst[item]._id || rst[item].nameLang === 'PSE') continue;

            vm.paymentMethods[rst[item]._id] = {
              name: rst[item].nameLang,
              pos: item
            };
          }
        }
      });
    }

    if (Authentication.user && Authentication.user.addresses) {
      var addresses = [];
      if (Array.isArray(Authentication.user.addresses)) addresses = Authentication.user.addresses;
      else addresses = [Authentication.user.addresses];

      vm.showAddressForm = addresses.length === 0;
    }

    function initAddress() {
      if (Authentication.user) {
        for (var index = 0; index < Authentication.user.addresses.length; index++) {
          if (Authentication.user.addresses[index].isDefaultAddress) {
            vm.address.radio = Authentication.user.addresses[index]._id;
            vm.order.address = Authentication.user.addresses[index];
          }
        }

        vm.showAddressForm = Authentication.user.addresses.length === 0;
      }
    }

    function onUserSignupSuccess(response) {
      Authentication.user = response;
      vm.showAddressForm = true;
      initAddress();
      findPaymentMethods();
      findShippers();
      vm.shippingPrice = getShippingPrice();

      Notification.success({
        message: '<i class="far fa-thumbs-up"></i> Signup successful!'
      });
    }

    vm.changeAddress = function (address) {
      for (var index = 0; index < Authentication.user.addresses.length; index++) {
        if (Authentication.user.addresses[index]._id === address._id) {
          Authentication.user.addresses[index].isDefaultAddress = true;
          vm.order.address = address;
        } else {
          Authentication.user.addresses[index].isDefaultAddress = false;
        }
      }

      var user = new UsersService(Authentication.user);

      user
        .$update()
        .then(function () {
          $scope.$broadcast('show-errors-reset', 'vm.addressForm');

          Notification.success({
            message:
              '<i class="glyphicon glyphicon-ok"></i> ' + $translate.instant('USER.ADDRESS_UPDATED')
          });
        })
        .catch(showErrorNotification);

      vm.shippingPrice = getShippingPrice();
    };

    vm.addAddress = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.addressForm');
        return false;
      }

      var user = new UsersService(Authentication.user);

      // CHANGE DEFAULT ADDRESS
      for (var i = 0; i < Authentication.user.addresses.length; i++) {
        if (vm.address.isDefaultAddress === true) {
          Authentication.user.addresses[i].isDefaultAddress = false;
        }
      }

      if (
        !vm.address._id &&
        vm.address.address &&
        vm.address.country &&
        vm.address.city &&
        vm.address.zone
      ) {
        Authentication.user.addresses.push(vm.address);
        vm.order.address = vm.address;
      }

      user
        .$update()
        .then(function (response) {
          $scope.$broadcast('show-errors-reset', 'vm.addressForm');

          Notification.success({
            message:
              '<i class="glyphicon glyphicon-ok"></i> ' + $translate.instant('USER.ADDRESS_UPDATED')
          });
          Authentication.user = response;
          initAddress();
          clearForm();
          vm.shippingPrice = getShippingPrice();
        })
        .catch(showErrorNotification);
    };

    /**
     *
     * @param {object} item
     * @returns {object} product
     */
    function mapProductsToGTM(item) {
      // TODO: recibir la categoría de los productos solo con 1 categoryLang
      return {
        item_name: item.product.productLang.name,
        item_id: item.product._id,
        item_price: item.unitPrice,
        price: item.unitPrice, // For 'begin_checkout' event
        item_brand: item.product.maker_id.name,
        item_variant: item.combination_id,
        quantity: item.quantity,
        category: item.product.category_id[0].categoryLang[0].name,
        item_category: item.product.category_id[0].categoryLang[0].name // For 'begin_checkout' event
      };
    }

    function sendDataToGTM(order, cart) {
      if (window.env === 'production') {
        var products = cart.map(mapProductsToGTM);
        window.dataLayer = window.dataLayer || [];

        window.dataLayer.push({
          event: 'purchase',
          ecommerce: {
            purchase: {
              transaction_id: order._id,
              affiliation: 'Online Store',
              value: order.total,
              tax: '',
              shipping: vm.shippingPrice,
              currency: 'COP',
              items: products
            }
          }
        });

        window.dataLayer.push({
          event: 'begin_checkout',
          ecommerce: {
            items: products
          }
        });

        window.gtag = window.gtag || function () {};
        window.gtag('event', 'conversion', {
          send_to: 'AW-460739199/pVh6COP9ge0BEP-k2dsB',
          value: order.total,
          currency: 'COP',
          transaction_id: order._id
        });

        var productsIds = cart.map(function (item) {
          return item.product._id;
        });

        var productsNames = cart.map(function (item) {
          return item.product.productLang.name;
        });

        window.fbq = window.fbq || function () {};
        window.fbq('track', 'Purchase', {
          value: order.total,
          currency: 'COP',
          content_name: productsNames,
          content_type: 'product',
          content_ids: productsIds,
          num_items: cart.length
        });
      }
    }

    vm.remove = function (index) {
      vm.productsService.removeCartItem(index);
    };

    vm.signIn = function (isValid) {
      if (isValid) {
        UsersService.userSignin(vm.signin)
          .then(function (user) {
            Authentication.user = user;
            initAddress();
            findPaymentMethods();
            findShippers();
            vm.shippingPrice = getShippingPrice();
            Notification.info({ message: 'Welcome ' + user.firstName });
          })
          .catch(showErrorNotification);
      }
    };

    // CREATE ORDER FUNCTION.
    function createOrder() {
      return new Promise(function (resolve, reject) {
        new OrdersService(vm.order)
          .createOrUpdate()
          .then(function (res) {
            if (res) resolve(res);
          })
          .catch(function (err) {
            reject(err);
          });
      });
    }

    vm.removeCart = function () {
      productsService.removeCart();
    };

    vm.uploadPaymentReceipt = function (file) {
      if (file) console.log('');
    };

    function createOrderSuccess(order) {
      // CLOSE TRANSACTION MODAL
      $('#transactionDetailModal').modal('hide');
      Notification.success({ message: 'Su orden fue enviada' });
      sendDataToGTM(order, productsService.getCart());
      productsService.removeCart();
    }

    vm.orderByTransaction = function (hasPaymentReceipt) {
      if (hasPaymentReceipt) {
        managerFileResolve
          .createOrUpdateFile({
            id: false,
            files: vm.order.paymentReceipt,
            multiFiles: false
          })
          .then(function (params) {
            if (params[0]) {
              vm.order.paymentReceipt = params[0].data._id;
              createOrder().then(createOrderSuccess).catch(showErrorNotification);
            }
          })
          .catch(showErrorNotification);
      } else {
        delete vm.order.paymentReceipt;

        var optionsPaymentMethods = {
          sort: {
            modified: 'desc'
          },
          filter: { nameLang: 'pendiente por comprobante' }
        };

        $resource('/api/dataTypes/findAll', optionsPaymentMethods).query(function (res) {
          if (res) {
            vm.order.status = res[0]._id;
            createOrder().then(createOrderSuccess).catch(showErrorNotification);
          }
        });
      }
    };

    function showTransactionModal() {
      $('#stepsModal').modal('hide');
      setTimeout(function () {
        $('#transactionDetailModal').modal('show');
      }, 500);
    }

    function goToPayBinLab(res) {
      var custom = document.querySelector('#custom_input');
      custom.value = res._id;
      var amount = document.querySelector('#amount');
      amount.value = $rootScope.totalPrice + vm.shippingPrice;
      console.log(custom);
      console.log(document.getElementById('finishForm'));
      document.querySelector('#button-credit-card').click();
    }

    vm.signUp = function (isValid) {
      if (isValid) {
        UsersService.userSignup(vm.signup).then(onUserSignupSuccess).catch(showErrorNotification);
      }
    };

    // STEPS FORM
    $(document).ready(function () {
      if (Authentication.user) {
        initAddress();
        findPaymentMethods();
        findShippers();
      }
      // fieldsets
      var currentFs;
      var nextFs;
      var previousFs;
      var opacity;

      function nextStep(currentFs, nextFs) {
        // Add Class Active
        $('#progressbar li').eq($('fieldset').index(nextFs)).addClass('active');
        // show the next fieldset
        nextFs.show();
        // hide the current fieldset with style
        currentFs.animate(
          { opacity: 0 },
          {
            step: function (now) {
              // for making fielset appear animation
              opacity = 1 - now;
              currentFs.css({
                display: 'none',
                position: 'relative'
              });
              nextFs.css({ opacity: opacity });
            },
            duration: 600
          }
        );
      }

      $('.accept-button').click(function () {
        currentFs = $(this).parent();
        nextFs = $(this).parent().next();

        $resource('/api/dataTypes/findAll', {
          filter: {
            'alias_id.systemName': 'purchaseStatus',
            nameLang: 'pendiente por pago'
          }
        }).query({}, function (pendingPurchaseStatus) {
          vm.order.status = pendingPurchaseStatus[0]._id;
          vm.shippingPrice = getShippingPrice();
          vm.order.total = ($rootScope.totalPrice + vm.shippingPrice).toString();

          switch (vm.paymentMethods[vm.order.payType].name) {
            case 'Transacción':
              showTransactionModal();
              break;
            case 'Tarjeta de credito':
              createOrder()
                .then(function (order) {
                  if (order) {
                    storeOrderInLocalStorage(order);
                    sendDataToGTM(order, productsService.getCart());
                    goToPayBinLab(order);
                  }
                  nextStep(currentFs, nextFs);
                })
                .catch(showErrorNotification);
              break;
          }
        });
      });

      function storeOrderInLocalStorage(order) {
        localStorage.setItem(
          'order',
          JSON.stringify({
            _id: order._id,
            total: order.total,
            shipping: vm.shippingPrice
          })
        );
      }

      // ADDRESS FORM
      $('.address-form').click(function () {
        currentFs = $(this).parent();
        nextFs = $(this).parent().next();

        var validate = vm.address.radio ? vm.address.radio.length > 0 : false;
        if (validate) nextStep(currentFs, nextFs);
      });

      // SHIPPER FORM
      $('.shipper-form').click(function () {
        currentFs = $(this).parent();
        nextFs = $(this).parent().next();

        var validate = vm.order.shipper_id ? vm.order.shipper_id.length > 0 : false;
        if (validate) nextStep(currentFs, nextFs);
      });

      // SHIPPER FORM
      $('.payment-form').click(function () {
        currentFs = $(this).parent();
        nextFs = $(this).parent().next();

        nextStep(currentFs, nextFs);
      });

      $('.previous').click(function () {
        currentFs = $(this).parent();
        previousFs = $(this).parent().prev();

        // Remove class active
        $('#progressbar li').eq($('fieldset').index(currentFs)).removeClass('active');

        // show the previous fieldset
        previousFs.show();

        // hide the current fieldset with style
        currentFs.animate(
          { opacity: 0 },
          {
            step: function (now) {
              // for making fielset appear animation
              opacity = 1 - now;

              currentFs.css({
                display: 'none',
                position: 'relative'
              });
              previousFs.css({ opacity: opacity });
            },
            duration: 600
          }
        );
      });

      $('.radio-group .radio').click(function () {
        $(this).parent().find('.radio').removeClass('selected');
        $(this).addClass('selected');
      });

      $('.submit').click(function () {
        return false;
      });
    });

    function clearForm() {
      vm.address.address = '';
      vm.address.country = '';
      vm.address.postalCode = '';
      vm.address.city = '';
      vm.address.zone = '';
    }

    function showErrorNotification(err) {
      var message = err.data ? err.data.message : err;
      Notification.warning({
        message: message
      });
    }
  }
})();
