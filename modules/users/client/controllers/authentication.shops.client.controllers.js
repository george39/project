(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationShopsController', AuthenticationShopsController);

  AuthenticationShopsController.$inject = [
    '$scope',
    '$state',
    'UsersService',
    '$location',
    '$window',
    'Authentication',
    'PasswordValidator',
    'Notification',
    '$translate'
  ];

  function AuthenticationShopsController(
    $scope,
    $state,
    UsersService,
    $location,
    $window,
    Authentication,
    PasswordValidator,
    Notification,
    $translate
  ) {
    const vm = this;

    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.callOauthProvider = callOauthProvider;
    vm.usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;

    // Get an eventual error defined in the URL query string:
    if ($location.search().err) {
      Notification.warning({ message: $location.search().err });
    }

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }

    function signup(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }

      UsersService.shopSignup(vm.credentials).then(onUserSignupSuccess).catch(onUserSignupError);
    }

    function signin(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }

      UsersService.userSignin(vm.credentials).then(onUserSigninSuccess).catch(onUserSigninError);
    }

    // OAuth provider request
    function callOauthProvider(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }

    // Authentication Callbacks

    function onUserSignupSuccess(response) {
      // If successful we assign the response to the global user model
      vm.authentication.user = response;
      Notification.success({ message: '<i class="far fa-thumbs-up"></i> Signup successful!' });
      // And redirect to the previous or home page
      $state.go('home');
    }

    function onUserSignupError(response) {
      // eslint-disable-next-line new-cap
      Notification({ message: $translate.instant(response.data.message) }, 'warning');
    }

    function onUserSigninSuccess(response) {
      // If successful we assign the response to the global user model
      vm.authentication.user = response;
      Notification.info({ message: 'Welcome ' + response.firstName });
      // And redirect to the previous or home page
      $state.go('home');
      // $state.go($state.previous.state.name || 'home', $state.previous.params);
      // $window.location.href = '/';
    }

    function onUserSigninError(response) {
      // eslint-disable-next-line new-cap
      Notification({ message: $translate.instant(response.data.message) }, 'warning');
    }
  }
})();

