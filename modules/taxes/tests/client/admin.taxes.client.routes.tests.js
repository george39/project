(function () {
  'use strict';

  describe('Taxes Route Tests', function () {
    // Initialize global variables
    var $scope;
    var TaxesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _TaxesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      TaxesService = _TaxesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.taxes');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/taxes');
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
          liststate = $state.get('admin.taxes.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/taxes/client/views/admin/list-taxes.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var TaxesAdminController;
        var mockTax;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.taxes.create');
          $templateCache.put(
            '/modules/taxes/client/views/admin/form-tax.client.view.html',
            ''
          );

          // Create mock tax
          mockTax = new TaxesService();

          // Initialize Controller
          TaxesAdminController = $controller('TaxesAdminController as vm', {
            $scope: $scope,
            taxResolve: mockTax
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.taxResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/taxes/create');
        }));

        it('should attach an tax to the controller scope', function () {
          expect($scope.vm.tax._id).toBe(mockTax._id);
          expect($scope.vm.tax._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/taxes/client/views/admin/form-tax.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var TaxesAdminController;
        var mockTax;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.taxes.edit');
          $templateCache.put(
            '/modules/taxes/client/views/admin/form-tax.client.view.html',
            ''
          );

          // Create mock tax
          mockTax = new TaxesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Tax about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          TaxesAdminController = $controller('TaxesAdminController as vm', {
            $scope: $scope,
            taxResolve: mockTax
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:taxId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.taxResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              taxId: 1
            })
          ).toEqual('/admin/taxes/1/edit');
        }));

        it('should attach an tax to the controller scope', function () {
          expect($scope.vm.tax._id).toBe(mockTax._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/taxes/client/views/admin/form-tax.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
