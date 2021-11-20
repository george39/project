(function () {
  'use strict';

  angular.module('core').controller('WorkWithUsController', WorkWithUsController);

  WorkWithUsController.$inject = ['$resource'];

  function WorkWithUsController($resource) {
    var vm = this;
    vm.currentLang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');
    vm.workWithUsForm = {};
    vm.userdata = {};

    vm.sendForm = function (isValid) {
      if (isValid) {
        var Req = $resource('/api/users/workWithUs');
        Req.save(vm.userdata, function (res) {
          console.log(res);
        });
      }
    };

    vm.uploadCurriculum = function (file) {};

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
