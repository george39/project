(function () {
  'use strict';

  angular.module('users.admin').controller('ViewUserProfileController', ViewUserProfileController);

  ViewUserProfileController.$inject = [
    'Authentication',
    'userResolve',
    '$resource',
    '$state',
    'Notification'
  ];

  function ViewUserProfileController(Authentication, user, $resource, $state, Notification) {
    const vm = this;

    vm.authentication = Authentication;
    vm.user = user;
    vm.disableFormUser = false;
    vm.follow = follow;
    vm.isAlreadyFollowed = false;

    function isAlreadyFollowed(userId) {
      const Follow = $resource('/api/follow/' + userId).get({}).$promise;
      return Follow.then((res) => {
        if (res.data !== null) {
          changeFollowState(true);
        } else {
          changeFollowState(false);
        }
      }).catch(showError);
    }

    function changeFollowState(state) {
      vm.isAlreadyFollowed = state;
      vm.buttonLabel = state ? 'Unfollow' : 'Follow';
    }

    function follow(userId, action) {
      const query = $resource('/api/follow/' + userId);

      if (vm.authentication.user && action === 'follow') {
        const Follow = query.save({}).$promise;

        Follow.then(() => {
          changeFollowState(true);
          vm.user.followers += 1;
        }).catch(showError);
      } else if (vm.authentication.user && action === 'unfollow') {
        const Follow = query.remove({}).$promise;

        Follow.then(() => {
          changeFollowState(false);
          if (vm.user.followers > 0) vm.user.followers += -1;
        }).catch(showError);
      } else {
        return $state.go('authentication.signin', {
          redirect: 'admin.view-user-profile,userId,' + userId
        });
      }
    }

    function showError(err) {
      Notification.warning(err.data.message);
    }

    isAlreadyFollowed(vm.user._id);
  }
})();
