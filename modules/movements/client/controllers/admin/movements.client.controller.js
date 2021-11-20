(function () {
  'use strict';

  angular.module('movements').controller('MovementsController', MovementsController);

  MovementsController.$inject = [
    '$state',
    'movementResolve',
    'Authentication',
    'Notification',
    '$translate',
    '$resource'
  ];

  function MovementsController(
    $state,
    movement,
    Authentication,
    Notification,
    $translate,
    $resource
  ) {
    var vm = this;

    vm.movement = movement;
    vm.authentication = Authentication;
    vm.form = {};
    vm.save = save;
    vm.findAllCombinationByProduct = findAllCombinationByProduct;
    vm.listProducts = [];
    vm.listFeatureDetails = [];
    vm.listTypeMovements = [];
    vm.listOrders = [];
    vm.listDetails = [];

    var optionsTypeMovements = {
      field: ['name'],
      sort: {
        modified: 'desc'
      },
      filter: { 'alias_id.systemName': 'typeMovement' },
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    vm.movement.findAllTypeMovements(optionsTypeMovements, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listTypeMovements.push({ _id: rst[item]._id, name: rst[item].nameLang });
        }
      }
    });

    var optionsOrders = {
      field: ['name'],
      sort: {
        modified: 'desc'
      },
      filter: {},
      populate: [
        {
          path: '',
          select: ''
        }
      ]
    };

    vm.movement.findAllOrders(optionsOrders, function (rst) {
      if (rst.length > 0) {
        for (var item in rst) {
          if (!rst[item]._id) {
            continue;
          }
          vm.listOrders.push({ _id: rst[item]._id, name: rst[item].name });
        }
      }
    });

    function findAllCombinationByProduct(productId) {
      var optionsFindAllCombinationByProduct = {
        field: ['name'],
        sort: {
          modified: 'desc'
        },
        filter: { 'product_id._id': productId, status: true },
        populate: [
          {
            path: '',
            select: ''
          }
        ]
      };

      vm.movement.findAllCombinationByProduct(optionsFindAllCombinationByProduct, function (rst) {
        if (rst.length > 0) {
          const listCombinations = [];

          for (const item in rst) {
            if (!rst[item]._id) {
              continue;
            }

            let combinations = '';

            for (const itemFD in rst[item].featureDetail_id) {
              if (!rst[item].featureDetail_id[itemFD]._id) {
                continue;
              }

              combinations +=
                rst[item].featureDetail_id[itemFD].parentNameLang +
                ': ' +
                rst[item].featureDetail_id[itemFD].nameLang +
                '. ';
            }

            listCombinations.push({ _id: rst[item]._id, name: combinations });
          }

          vm.listFeatureDetails = listCombinations;
        }
      });
    }

    if (vm.movement._id) {
      const params = {
        _id: vm.movement._id
      };

      vm.movement.findMovementDetail(params, function (rst) {
        vm.listDetails = rst;
      });
    }

    // Save Movement
    function save(isValid) {
      if (!isValid) {
        // $scope.$broadcast('show-errors-check-validity', 'vm.form.movementForm');
        Array.prototype.filter.call(document.getElementsByClassName('needs-validation'), function (
          form
        ) {
          form.classList.add('was-validated');
        });
        return false;
      }

      // Create a new movement, or update the current instance
      vm.movement.createOrUpdate().then(successCallback).catch(errorCallback);

      function successCallback(res) {
        $state.go('movements.list'); // should we send the User to the list or the updated Movement's view?
        Notification.success({
          message: '<i class="far fa-thumbs-up"></i> ' + $translate.instant('MOVEMENT.SAVED_OK')
        });
      }

      function errorCallback(res) {
        Notification.warning({
          message: res.data.message,
          title: '<i class="fas fa-trash-alt"></i> ' + $translate.instant('MOVEMENT.SAVED_FAIL')
        });
      }
    }

    // AUTOCOMPLETE
    var inp = document.getElementById('productInput');
    var arr = [];
    var currentFocus;
    /* execute a function when someone writes in the text field:*/
    inp.addEventListener('input', function () {
      const lang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');
      const optionsProducts = {
        field: ['productLang'],
        sort: {},
        count: 12,
        page: 1,
        lang: lang,
        filter: {
          'productLang.name': {
            $regex: inp.value,
            $options: 'i'
          }
        }
      };

      const products = [];
      $resource('/api/products').get(optionsProducts, function (rst) {
        if (!rst) {
          return;
        }

        for (let indx = 0; indx < rst.results.length; indx++) {
          products.push({
            _id: rst.results[indx]._id,
            name: rst.results[indx].productLang[0].name
          });
        }

        arr = products;
        const val = inp.value;
        /* close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
          return false;
        }

        currentFocus = -1;
        /* create a DIV element that will contain the items (values):*/
        const a = document.createElement('DIV');
        a.setAttribute('id', inp.id + 'autocomplete-list');
        a.setAttribute('class', 'autocomplete-items');
        /* append the DIV element as a child of the autocomplete container:*/
        inp.parentNode.appendChild(a);
        /* for each item in the array...*/
        for (let i = 0; i < arr.length; i++) {
          /* check if the item starts with the same letters as the text field value:*/
          if (arr[i].name.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
            /* create a DIV element for each matching element:*/
            const b = document.createElement('DIV');
            /* make the matching letters bold:*/
            b.innerHTML = '<strong>' + arr[i].name.substr(0, val.length) + '</strong>';
            b.innerHTML += arr[i].name.substr(val.length);
            /* insert a input field that will hold the current array item's value:*/
            b.innerHTML +=
              '<input type="hidden" id="' +
              arr[i]._id +
              '" value=\'' +
              JSON.stringify(arr[i]) +
              '\'>';
            /* execute a function when someone clicks on the item value (DIV element):*/
            // eslint-disable-next-line no-loop-func
            b.addEventListener('click', function (e) {
              /* insert the value for the autocomplete text field:*/
              const value = JSON.parse(e.target.getElementsByTagName('input')[0].value);
              inp.value = value.name;
              vm.movement.product_id = value;
              vm.findAllCombinationByProduct(value._id);
              /* close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
            });
            a.appendChild(b);
          }
        }
      });
      /* execute a function presses a key on the keyboard:*/
      inp.addEventListener('keydown', function (e) {
        let x = document.getElementById(inp.id + 'autocomplete-list');
        if (x) x = x.getElementsByTagName('div');
        if (e.keyCode === 40) {
          /* If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
          currentFocus++;
          /* and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode === 38) {
          // up
          /* If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
          currentFocus--;
          /* and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode === 13) {
          /* If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /* and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
      });

      /* execute a function when someone clicks in the document:*/
      document.addEventListener('click', function (e) {
        closeAllLists(e.target);
      });
    });

    function addActive(x) {
      /* a function to classify an item as "active":*/
      if (!x) return false;
      /* start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = x.length - 1;
      /* add class "autocomplete-active":*/
      x[currentFocus].classList.add('autocomplete-active');
    }
    function removeActive(x) {
      /* a function to remove the "active" class from all autocomplete items:*/
      for (let i = 0; i < x.length; i++) {
        x[i].classList.remove('autocomplete-active');
      }
    }
    function closeAllLists(elmnt) {
      /* close all autocomplete lists in the document,
    except the one passed as an argument:*/
      const x = document.getElementsByClassName('autocomplete-items');
      for (let i = 0; i < x.length; i++) {
        if (elmnt !== x[i] && elmnt !== inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
  }
})();
