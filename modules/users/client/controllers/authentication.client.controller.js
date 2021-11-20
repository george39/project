(function () {
  'use strict';

  angular.module('users').controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = [
    '$scope',
    '$state',
    'UsersService',
    '$location',
    '$window',
    'Authentication',
    'PasswordValidator',
    'Notification',
    '$translate',
    '$stateParams'
  ];

  function AuthenticationController(
    $scope,
    $state,
    UsersService,
    $location,
    $window,
    Authentication,
    PasswordValidator,
    Notification,
    $translate,
    $stateParams
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

      UsersService.userSignup(vm.credentials).then(onUserSignupSuccess).catch(onUserSignupError);
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
      const redirect = $location.search().redirect;

      if (redirect) {
        const [state, param, value] = redirect.split(',');
        const params = {};
        params[param] = value;
        return $state.go(state, params);
      }

      return $state.go('home');
    }

    function onUserSigninError(response) {
      // eslint-disable-next-line new-cap
      Notification({ message: $translate.instant(response.data.message) }, 'warning');
    }
  }
})();

