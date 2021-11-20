(function () {
  'use strict';

  angular.module('core').controller('HeaderController', HeaderController);

  HeaderController.$inject = [
    '$rootScope',
    'ProductsService',
    '$scope',
    '$resource',
    '$state',
    'Authentication',
    'menuService',
    '$translate',
    'Notification'
  ];

  function HeaderController(
    $rootScope,
    ProductsService,
    $scope,
    $resource,
    $state,
    Authentication,
    menuService,
    $translate,
    Notification
  ) {
    const vm = this;
    vm.notifications = [];
    vm.search = '';
    vm.productService = new ProductsService();
    $rootScope.cart = vm.productService.getCart() || [];
    vm.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

    vm.searchProducts = function () {
      if (vm.search !== '') {
        $state.go('search-products', { query: vm.search.replace(/ /gi, '_') });
      }
    };

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    if (vm.authentication.user === 'null') {
      vm.authentication.user = false;
    }

    if (vm.authentication.user !== 'null' && typeof vm.authentication.user === 'string') {
      vm.authentication.user = JSON.parse(vm.authentication.user);
    }

    $scope.setLang = function (langKey) {
      // You can change the language during runtime
      $translate.use(langKey);
      // localStorage.setItem('lang', langKey);
    };

    vm.toggleSidebar = toggleSidebar;

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }

    if (vm.authentication.user) {
      const notificationParams = {
        count: 8
      };

      const promiseNotifications = $resource('/api/notifications', notificationParams).get({})
        .$promise;

      promiseNotifications
        .then((res) => res.results)
        .then((notifications) => {
          vm.notifications = notifications;
          // count unread notifications
          vm.unreadNotifications = notifications.reduce((acc, notification) => {
            if (!notification.read) acc++;
            return acc;
          }, 0);
        })
        .catch((e) => Notification.warning({ message: e.data.message }));
    }

    vm.seeNotification = (notificationId, redirect) => {
      const readNotifications = $resource('/api/notifications/readNotifications');
      readNotifications
        .save({ notifications: [notificationId] })
        .$promise.then((res) => console.log(res))
        .catch((e) => console.error(e));

      $state.go(redirect.state, redirect.params);
    };

    function toggleSidebar(e) {
      const _class = vm.isSafari ? 'safari' : 'd-none';
      // Toggle the side navigation
      $('body').toggleClass('sidebar-toggled');
      $('#accordionSidebar').toggleClass('toggled');
      $('#accordionSidebar').removeClass(_class);
      if ($('#accordionSidebar').hasClass('toggled')) {
        $('#accordionSidebar .collapse').collapse('hide');
        $('#accordionSidebar').addClass(_class);
      }
    }
  }
})();
