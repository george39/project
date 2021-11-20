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
          mainstate = $state.get('admin.shippers');
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
          liststate = $state.get('admin.shippers.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/shippers/client/views/admin/list-shippers.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var ShippersAdminController;
        var mockShipper;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.shippers.create');
          $templateCache.put(
            '/modules/shippers/client/views/admin/form-shipper.client.view.html',
            ''
          );

          // Create mock shipper
          mockShipper = new ShippersService();

          // Initialize Controller
          ShippersAdminController = $controller('ShippersAdminController as vm', {
            $scope: $scope,
            shipperResolve: mockShipper
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.shipperResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/shippers/create');
        }));

        it('should attach an shipper to the controller scope', function () {
          expect($scope.vm.shipper._id).toBe(mockShipper._id);
          expect($scope.vm.shipper._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/shippers/client/views/admin/form-shipper.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var ShippersAdminController;
        var mockShipper;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.shippers.edit');
          $templateCache.put(
            '/modules/shippers/client/views/admin/form-shipper.client.view.html',
            ''
          );

          // Create mock shipper
          mockShipper = new ShippersService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Shipper about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ShippersAdminController = $controller('ShippersAdminController as vm', {
            $scope: $scope,
            shipperResolve: mockShipper
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:shipperId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.shipperResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              shipperId: 1
            })
          ).toEqual('/admin/shippers/1/edit');
        }));

        it('should attach an shipper to the controller scope', function () {
          expect($scope.vm.shipper._id).toBe(mockShipper._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/shippers/client/views/admin/form-shipper.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
