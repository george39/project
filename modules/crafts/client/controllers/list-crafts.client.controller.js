(function () {
  'use strict';

  angular.module('crafts').controller('ListCraftsController', ListCraftsController);

  ListCraftsController.$inject = [
    '$scope',
    '$state',
    '$window',
    'craftResolve',
    'Authentication',
    'Notification',
    '$translate',
    'managerFileResolve',
    '$resource',
    '$stateParams'
  ];

  function ListCraftsController(
    $scope,
    $state,
    $window,
    craft,
    Authentication,
    Notification,
    $translate,
    managerFileResolve,
    $resource,
    $stateParams
  ) {
    var vm = this;
    vm.craft = craft;
    vm.modalCraft = {};
    vm.authentication = Authentication;
    vm.crafts = [];
    vm.categoryName = $stateParams.categoryName;

    var params = {
      filter: {
        'category_id.categoryLang.name': $stateParams.categoryName
      },
      lang: localStorage.getItem('NG_TRANSLATE_LANG_KEY')
    };

    $resource('/api/crafts').get(params, function (res) {
      if (res) {
        vm.crafts = res.results;
      }
    });

    vm.goTo = function (_craft) {
      if (!_craft.isFree && !_craft.show) {
        vm.modalCraft = _craft;
        $('#modalBuyCraft').modal({
          show: true
        });
      } else {
        $state.go('crafts.view', { craftId: _craft._id, categoryName: vm.categoryName });
      }
    };

    vm.buyCraft = function () {
      var CraftUser = $resource('/api/craftsUsers');
      var newCraftUser = new CraftUser({ craft_id: vm.modalCraft._id, price: vm.modalCraft.price });
      newCraftUser.$save().then(function (res) {
        if (res) {
          console.log(res);
          document.querySelector('#craft_amount').value = vm.modalCraft.price || 0;
          document.querySelector('#crafts_custom_input').value = res._id;
          document.querySelector('#buy_craft_form').submit();
        }
      });
    };
  }
})();
