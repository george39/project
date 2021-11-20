(function () {
  'use strict';

  angular
    .module('crafts')
    .config(function ($sceDelegateProvider) {
      $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain. **.
        'https://youtube.com/**'
      ]);
    })
    .controller('CraftsController', CraftsController);

  CraftsController.$inject = ['craftResolve', 'Authentication', '$sce'];

  function CraftsController(craft, Authentication, $sce) {
    var vm = this;
    vm.craft = craft;
    vm.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };
    vm.authentication = Authentication;
  }
})();
