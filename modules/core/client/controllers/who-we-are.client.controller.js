(function () {
  'use strict';

  angular.module('core').controller('WhoWeAreController', WhoWeAreController);

  WhoWeAreController.$inject = ['$resource', '$state'];

  function WhoWeAreController($resource, $state) {
    var vm = this;
    vm.currentLang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');

    var params = {
      filter: {
        friendly: {
          $in: ['who_we_are_header', 'who_we_are_body']
        }
      }
    };

    $resource('/api/managerConfigurations').get(params, function (res) {
      if (res) {
        vm.header = res.results.filter(function (conf) {
          return conf.friendly === 'who_we_are_header';
        })[0];

        vm.body = res.results.filter(function (conf) {
          return conf.friendly === 'who_we_are_body';
        })[0];
      }
    });
  }
})();
