(function () {
  'use strict';

  angular.module('products').controller('ProductsViewController', ProductsViewController);

  ProductsViewController.$inject = [
    '$resource',
    'productService',
    'productResolve',
    'newMovement',
    '$state',
    '$scope',
    'CategoriesService',
    'Authentication',
    'Notification'
  ];

  function ProductsViewController(
    $resource,
    productService,
    productResolve,
    newMovement,
    $state,
    $scope,
    CategoriesService,
    Authentication,
    Notification
  ) {
    const vm = this;

    // FUNCTIONS
    vm.seeUsersThatUseThisProduct = seeUsersThatUseThisProduct;
    vm.addOrRemoveProductFromFavorites = addOrRemoveProductFromFavorites;
    vm.authentication = Authentication;
    vm.product = productResolve;
    vm.price = vm.product.discountPrice || vm.product.priceTaxIncluded;
    var price = vm.product.discountPrice || vm.product.priceTaxIncluded;
    var oldPrice = vm.product.priceTaxIncluded;
    vm.oldPrice = vm.product.priceTaxIncluded;
    vm.productService = productService;
    vm.usersThatUseThisProduct = [];
    vm.features = [];
    vm.form = {};
    vm.form.details = {};
    vm.amount = 0;
    vm.details = {};
    vm.showAmount = false;
    var combinations = [];
    var aux = []; // Variable auxiliar que almacenará las combinaciones originales para no perderlas.
    const currentLang = localStorage.getItem('NG_TRANSLATE_LANG_KEY');

    const currentCategory = localStorage.getItem('currentCategory');

    if (Authentication.user) {
      vm.isAlreadyInFavorites = isAlreadyInFavorites(Authentication.user._id, vm.product._id);
      seeUsersThatUseThisProduct();
    }

    if (currentCategory) {
      vm.currentCategory = JSON.parse(currentCategory);
    }

    // Si el producto es "PRODUCTO SIMPLE", mostrar la cantidad de productos con los que cuenta
    if (vm.product.typeCombination === 1) {
      vm.amount = vm.product.quantity;
      vm.showAmount = true;
    }

    vm.currentImage = vm.product.managerFile_id[0];
    vm.images = vm.product.managerFile_id;
    vm.form.product = vm.product;

    vm.data = vm.product.productLang.filter(function (i) {
      return i.lang_id.languageCode === currentLang;
    });

    if (vm.data.length === 0) vm.data = [vm.product.productLang[0]];

    vm.form.product.productLang = vm.data[0];

    /**
     * @description hacer zoom a la imagen del producto
     */
    $(document).ready(function () {
      var img = document.getElementById('productImage');
      var result = document.getElementById('myresult');
      /* create lens:*/
      var lens = document.createElement('DIV');
      lens.setAttribute('class', 'img-zoom-lens');
      /* insert lens:*/
      img.parentElement.insertBefore(lens, img);
      /* calculate the ratio between result DIV and lens:*/
      var cx = result.offsetWidth / lens.offsetWidth;
      var cy = result.offsetHeight / lens.offsetHeight;
      /* set background properties for the result DIV:*/
      result.style.backgroundImage = 'url("' + img.src + '")';
      result.style.backgroundSize = img.width * cx + 'px ' + img.height * cy + 'px';
      /* execute a function when someone moves the cursor over the image, or the lens:*/
      lens.addEventListener('mousemove', moveLens);
      img.addEventListener('mousemove', moveLens);

      lens.addEventListener('mouseout', mouseOut);
      img.addEventListener('mouseout', mouseOut);
      lens.style.visibility = 'hidden';
      result.style.visibility = 'hidden';

      function mouseOut() {
        lens.style.visibility = 'hidden';
        result.style.visibility = 'hidden';
      }

      function moveLens(e) {
        img = document.getElementById('productImage');
        lens.style.visibility = 'visible';
        result.style.backgroundImage = 'url("' + img.src + '")';
        result.style.visibility = 'visible';
        var pos;
        var x;
        var y;
        /* prevent any other actions that may occur when moving over the image:*/
        e.preventDefault();
        /* get the cursor's x and y positions:*/
        pos = getCursorPos(e);
        /* calculate the position of the lens:*/
        x = pos.x - lens.offsetWidth / 2;
        y = pos.y - lens.offsetHeight / 2;
        /* prevent the lens from being positioned outside the image:*/
        if (x > img.width - lens.offsetWidth) x = img.width - lens.offsetWidth;

        if (x < 0) x = 0;

        if (y > img.height - lens.offsetHeight) y = img.height - lens.offsetHeight;

        if (y < 0) y = 0;

        /* set the position of the lens:*/
        lens.style.left = x + 'px';
        lens.style.top = y + 'px';
        /* display what the lens "sees":*/
        result.style.backgroundPosition = '-' + x * cx + 'px -' + y * cy + 'px';
      }
      function getCursorPos(e) {
        var a;
        var x = 0;
        var y = 0;
        e = e || window.event;
        /* get the x and y positions of the image:*/
        a = img.getBoundingClientRect();
        /* calculate the cursor's x and y coordinates, relative to the image:*/
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        /* consider any page scrolling:*/
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x: x, y: y };
      }
    });

    /**
     * @author Jonathan Correa
     *
     * @param {object} features objeto que contiene las combinaciones después de pasar por la función parseFeatures
     *
     * @description se convierte el objeto en un array para poder hacer un ordenamiento en la vista.
     * @returns {array} devuelve un array con las combinaciones.
     *
     */
    function convertToArray(features) {
      var array = []; // Array que mutará e ira modificando el valor de vm.features
      var copy = []; // Array que almacenará la copia original y que no mutará

      angular.forEach(features, function (value, key) {
        array.push({
          name: key,
          order: value.order,
          items: value.items,
          typeFeature: value.typeFeature
        });

        // se crea un array secundario para que no compartan el mismo espacio en memoria y no se alteren uno al otro.
        copy.push({
          name: key,
          order: value.order,
          items: value.items,
          typeFeature: value.typeFeature
        });
      });

      aux = copy;

      return array;
    }

    /**
     * @author Jonathan Correa
     *
     * @param {object} value Valores para llenar el nuevo objeto
     * @param {boolean} shouldRender valor que define si el input estará desactivado o no.
     */
    function createItem(value, shouldRender) {
      var obj = {
        _id: value._id,
        nameLang: value.nameLang,
        parentNameLang: value.parentNameLang,
        order: value.order,
        parentId: value.parentId,
        shouldRender: shouldRender
      };

      return obj;
    }

    /**
     * @author Jonathan Correa
     *
     * @param {array} movements resultado de la busqueda
     * @return {array} Retorna un array con las carácteristicas ordenadas
     */
    function parseFeatures(movements) {
      var features = {}; // objeto donde se almacenarán las caracteristicas.
      var aux = {}; // objeto que servirá como helper para saber cuantas veces se repite una carácteristica y en que posiciones se encontró
      angular.forEach(movements, function (item) {
        item.featureDetail_id.forEach(function (featureDetail) {
          var parentName = featureDetail.parentNameLang;
          if (!features.hasOwnProperty(parentName)) {
            features[parentName] = {
              items: []
            };
          }

          features[parentName].order = featureDetail.parentId.order;
          features[parentName].typeFeature = featureDetail.parentId.typeFeature_id.nameLang;

          if (!aux.hasOwnProperty(featureDetail._id)) {
            aux[featureDetail._id] = true;
            features[parentName].items.push(createItem(featureDetail, true));
          }
        });
      });

      return features;
    }

    /**
     * @author Jonathan Correa
     *
     * @param {object} features almacena los items dependiendo su typeDetail.
     *
     * @return {void}
     */
    function onChange(features, typeFeature, flag) {
      for (var i = 0; i < aux.length; i++) {
        var array = [];
        // eslint-disable-next-line no-loop-func
        angular.forEach(aux[i].items, function (value, key) {
          var exists = false;
          features[aux[i].name].items.forEach(function (item) {
            if (value._id === item._id) {
              exists = true;
            }
          });

          var obj = createItem(value, false);

          if (exists) {
            obj.shouldRender = true;
          }

          array.push(obj);
        });

        if (
          Object.keys(vm.form.details).length === 0 ||
          (Object.keys(vm.form.details).length === 1 &&
            flag === 2 &&
            vm.features[i].name === typeFeature) ||
          vm.features[i].name !== typeFeature
        ) {
          vm.features[i].items = array;
        }
      }
    }

    const params = {
      filter: { 'product_id._id': vm.product._id, status: true }
    };

    /**
     * @author Jonathan Correa
     *
     * @param {object} params
     * @description busca todas las combinaciones activas asociadas al producto.
     *
     * @returns {void}
     */
    newMovement.findAllMovements(params, function (res) {
      const result = parseFeatures(res);
      vm.features = convertToArray(result);
    });

    vm.showModal = function (isValid) {
      if (isValid) {
        const price = vm.product.discountPrice || vm.product.priceTaxIncluded;

        vm.form.price = vm.form.quantity * price;
        vm.form.unitPrice = price;
        vm.form.product.managerFile_id = vm.images;
        if (combinations[0]) {
          vm.details = combinations[0].featureDetail_id;
          vm.form.combination_id = combinations[0]._id;
        }

        vm.productService.addToCart(vm.form);
        $('#modal-product').modal('show');
      }
    };

    vm.goCategories = function (category) {
      if (!category) return Notification.warning({ message: 'Esta categoría no existe' });
      new CategoriesService().setCurrentCategory({
        _id: category._id,
        categoryLang: [
          {
            originalName: category.name
          }
        ]
      });

      $state.go('listCategories');
    };

    vm.goTo = function (param) {
      $('#modal-product').modal('hide');
      setTimeout(function () {
        $state.go(param);
        $('html, body').animate({ scrollTop: 0 }, 'slow');
      }, 600);
    };

    /**
     * @author Jonathan Correa
     *
     * @description Remueve los valores nulos que hay en el objeto 'vm.form.details'.
     */
    function removeNullValues() {
      for (const key in vm.form.details) {
        if (vm.form.details.hasOwnProperty(key)) {
          if (!vm.form.details[key]) {
            delete vm.form.details[key];
          }
        }
      }
    }

    /**
     * @author Jonathan Correa
     *
     * @param {array} res Combinaciones existentes
     *
     * @returns {void} actualiza la cantidad de elementos encontrados en la busqueda.
     */
    function showQuantity(res) {
      var balance = 0;
      res.forEach(function (item) {
        // eslint-disable-next-line radix
        balance += parseInt(item.balance);
      });

      vm.amount = balance;
      if (Object.keys(vm.form.details).length > 0) vm.showAmount = true;
      else vm.showAmount = false;
    }

    /**
     *
     * @author Jonathan Correa
     *
     * @param {string} typeFeature tipo de caracteristica que fué pulsada
     */
    vm.getMovement = function (typeFeature) {
      const flag = Object.keys(vm.form.details).length; // Almacena la cantidad de elementos existentes que hay antes de eliminar los nulos.
      removeNullValues();

      var featuresId = [];
      angular.forEach(vm.form.details, function (value, key) {
        featuresId.push(value);
      });

      var modules = $resource('/api/movements/findMovement');
      var params = {
        filter: {
          status: true,
          'product_id._id': vm.product._id
        }
      };

      if (Object.keys(vm.form.details).length > 0) {
        params.filter['featureDetail_id._id'] = featuresId;
      }

      modules.query(params, function (res) {
        if (res.length === 1) {
          vm.amount = res[0].balance;
          vm.showAmount = true;
          if (res[0].managerFile_id.length > 0) {
            vm.images = res[0].managerFile_id;
            vm.currentImage = res[0].managerFile_id[0];
          } else {
            vm.images = vm.product.managerFile_id;
            vm.currentImage = vm.product.managerFile_id[0];
          }

          if (res[0].price) {
            vm.price = res[0].price;
            vm.product.discountPrice = res[0].price;
            vm.oldPrice = '';
          } else {
            vm.price = price;
            vm.product.discountPrice = price;
            vm.oldPrice = oldPrice;
          }
        } else {
          vm.price = price;
          vm.product.discountPrice = price;
          vm.oldPrice = oldPrice;
        }

        combinations = res;
        onChange(parseFeatures(res), typeFeature, flag);
        showQuantity(res);
      });
    };

    function findDefault() {
      var findMovement = $resource('/api/movements/findAll');
      var _params = {
        filter: {
          status: true,
          'product_id._id': vm.product._id,
          isDefault: true
        }
      };
      findMovement.query(_params, function (res) {
        if (res && res[0]) {
          vm.amount = res[0].balance;
          vm.showAmount = true;
          combinations = res;

          angular.forEach(res[0].featureDetail_id, function (value) {
            vm.form.details[value.parentNameLang] = value._id;
          });

          if (res[0].managerFile_id.length > 0) {
            vm.images = res[0].managerFile_id;
            vm.currentImage = res[0].managerFile_id[0];
          }

          if (res[0].price) {
            vm.price = res[0].price;
            vm.product.discountPrice = res[0].price;
            vm.oldPrice = '';
          } else {
            vm.price = price;
            vm.product.discountPrice = price;
            vm.oldPrice = oldPrice;
          }
        } else {
          vm.price = price;
          vm.product.discountPrice = price;
          vm.oldPrice = oldPrice;
        }
      });
    }

    function addOrRemoveProductFromFavorites(userId, productId) {
      if (vm.isAlreadyInFavorites) {
        console.log('Borrar');
        const favorites = $resource('/api/favorites/delete');
        const params = {
          filter: { user: userId, product: productId }
        };

        const promise = favorites.remove(params).$promise;
        promise.then((res) => console.log(res)).catch(showErrorNotification);
      } else {
        console.log('Agregar');
        const favorites = $resource('/api/favorites');
        const promise = favorites.save({ user: userId, product: productId }).$promise;

        promise.then((res) => console.log(res)).catch(showErrorNotification);
      }
    }

    function isAlreadyInFavorites(userId, productId) {
      const favorites = $resource('/api/favorites/findOne');
      const promise = favorites.get({ user: userId, product: productId }).$promise;
      return promise
        .then((res) => {
          if (res) return true;
          return false;
        })
        .catch(showErrorNotification);
    }

    function showErrorNotification(error) {
      Notification.warning(error.data.message);
    }

    function seeUsersThatUseThisProduct() {
      const users = $resource('/api/users/getUsersThatUseThisProduct/' + vm.product._id).query({})
        .$promise;

      users
        .then((res) => {
          vm.usersThatUseThisProduct = res;
        })
        .catch(showErrorNotification);
    }

    findDefault();

    $scope.$on('$destroy', function () {
      localStorage.setItem('currentCategory', null);
    });
  }
})();
