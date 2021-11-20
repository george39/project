(function () {
  'use strict';

  describe('Shippers Route Tests', function () {
    // Initialize global variables
    var $scope;
    var ShippersService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ShippersService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ShippersService = _ShippersService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('shippers');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/shippers');
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
          liststate = $state.get('shippers.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/shippers/client/views/list-shippers.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var ShippersController;
        var mockShipper;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('shippers.view');
          $templateCache.put('/modules/shippers/client/views/view-shipper.client.view.html', '');

          // create mock shipper
          mockShipper = new ShippersService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Shipper about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ShippersController = $controller('ShippersController as vm', {
            $scope: $scope,
            shipperResolve: mockShipper
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:shipperId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.shipperResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              shipperId: 1
            })
          ).toEqual('/shippers/1');
        }));

        it('should attach an shipper to the controller scope', function () {
          expect($scope.vm.shipper._id).toBe(mockShipper._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/shippers/client/views/view-shipper.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/shippers/client/views/list-shippers.client.view.html', '');

          $state.go('shippers.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('shippers/');
          $rootScope.$digest();

          expect($location.path()).toBe('/shippers');
          expect($state.current.templateUrl).toBe(
            '/modules/shippers/client/views/list-shippers.client.view.html'
          );
        }));
      });
    });
  });
})();
