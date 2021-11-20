(function () {
  'use strict';

  angular.module('crafts').controller('LatestCraftsController', LatestCraftsController);

  LatestCraftsController.$inject = [
    '$state',
    'craftResolve',
    'Authentication',
    'managerFileResolve',
    'lastCrafts',
    '$resource'
  ];

  function LatestCraftsController(
    $state,
    craft,
    Authentication,
    managerFileResolve,
    lastCrafts,
    $resource
  ) {
    var vm = this;
    vm.authentication = Authentication;
    vm.listCrafts = lastCrafts.results;
    vm.categories = [];

    $resource('/api/categories/crafts').query(
      {
        lang: localStorage.getItem('NG_TRANSLATE_LANG_KEY')
      },
      function (res) {
        if (res) {
          vm.categories = res;
        }
      }
    );

    vm.goToCategory = function (param) {
      $state.go('crafts.list', { categoryName: param });
    };

    vm.goTo = function (_craft) {
      if (!_craft.isFree && !_craft.show) {
        vm.modalCraft = _craft;
        $('#modalBuyCraft_latest').modal({
          show: true
        });
      } else {
        $state.go('crafts.view', {
          craftId: _craft._id,
          categoryName: _craft.category_id.categoryLang.name
        });
      }
    };

    vm.buyCraft = function () {
      var CraftUser = $resource('/api/craftsUsers');
      var newCraftUser = new CraftUser({ craft_id: vm.modalCraft._id, price: vm.modalCraft.price });
      newCraftUser.$save().then(function (res) {
        if (res) {
          console.log(res);
          document.querySelector('#craft_amount_latest').value = vm.modalCraft.price || 0;
          document.querySelector('#crafts_custom_input_latest').value = res._id;
          document.querySelector('#buy_craft_form_latest').submit();
        }
      });
    };
  }
})();
