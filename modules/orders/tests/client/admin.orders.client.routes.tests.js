(function () {
  'use strict';

  describe('Orders Route Tests', function () {
    // Initialize global variables
    var $scope;
    var OrdersService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _OrdersService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      OrdersService = _OrdersService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.orders');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/orders');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('admin.orders.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/orders/client/views/admin/list-orders.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var OrdersAdminController;
        var mockOrder;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.orders.create');
          $templateCache.put(
            '/modules/orders/client/views/admin/form-order.client.view.html',
            ''
          );

          // Create mock order
          mockOrder = new OrdersService();

          // Initialize Controller
          OrdersAdminController = $controller('OrdersAdminController as vm', {
            $scope: $scope,
            orderResolve: mockOrder
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.orderResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/orders/create');
        }));

        it('should attach an order to the controller scope', function () {
          expect($scope.vm.order._id).toBe(mockOrder._id);
          expect($scope.vm.order._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/orders/client/views/admin/form-order.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var OrdersAdminController;
        var mockOrder;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.orders.edit');
          $templateCache.put(
            '/modules/orders/client/views/admin/form-order.client.view.html',
            ''
          );

          // Create mock order
          mockOrder = new OrdersService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Order about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          OrdersAdminController = $controller('OrdersAdminController as vm', {
            $scope: $scope,
            orderResolve: mockOrder
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:orderId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.orderResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              orderId: 1
            })
          ).toEqual('/admin/orders/1/edit');
        }));

        it('should attach an order to the controller scope', function () {
          expect($scope.vm.order._id).toBe(mockOrder._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/orders/client/views/admin/form-order.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
