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
          mainstate = $state.get('orders');
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
          liststate = $state.get('orders.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/orders/client/views/list-orders.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var OrdersController;
        var mockOrder;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('orders.view');
          $templateCache.put('/modules/orders/client/views/view-order.client.view.html', '');

          // create mock order
          mockOrder = new OrdersService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Order about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          OrdersController = $controller('OrdersController as vm', {
            $scope: $scope,
            orderResolve: mockOrder
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:orderId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.orderResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              orderId: 1
            })
          ).toEqual('/orders/1');
        }));

        it('should attach an order to the controller scope', function () {
          expect($scope.vm.order._id).toBe(mockOrder._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/orders/client/views/view-order.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/orders/client/views/list-orders.client.view.html', '');

          $state.go('orders.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('orders/');
          $rootScope.$digest();

          expect($location.path()).toBe('/orders');
          expect($state.current.templateUrl).toBe(
            '/modules/orders/client/views/list-orders.client.view.html'
          );
        }));
      });
    });
  });
})();
