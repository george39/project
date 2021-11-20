(function () {
  'use strict';

  angular
    .module('users')
    .controller('EditUserPrivacyOptionsController', EditUserPrivacyOptionsController);

  EditUserPrivacyOptionsController.$inject = ['Authentication', 'Notification', '$resource'];

  function EditUserPrivacyOptionsController(Authentication, Notification, $resource) {
    const vm = this;
    vm.privacy = {};

    vm.user = Authentication.user;

    getPrivacyOptions();

    function getPrivacyOptions() {
      const privacy = $resource('/api/users/privacy').get({}).$promise;
      privacy
        .then((privacyOptions) => (vm.privacy = privacyOptions))
        .catch((err) => console.error(err));
    }

    vm.save = function (privacyOptions) {
      const privacy = $resource('/api/users/privacy');
      const response = privacy.save(privacyOptions).$promise;
      response
        .then(() => {
          Notification.success({
            message: '<i class="far fa-thumbs-up"></i> Guardado!'
          });
        })
        .catch((err) => {
          Notification.warning({
            message: err.data.message
          });
        });
    };
  }
})();
