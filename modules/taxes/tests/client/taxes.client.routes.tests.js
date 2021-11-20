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
          mainstate = $state.get('taxes');
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
          liststate = $state.get('taxes.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/taxes/client/views/list-taxes.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var TaxesController;
        var mockTax;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('taxes.view');
          $templateCache.put('/modules/taxes/client/views/view-tax.client.view.html', '');

          // create mock tax
          mockTax = new TaxesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Tax about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          TaxesController = $controller('TaxesController as vm', {
            $scope: $scope,
            taxResolve: mockTax
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:taxId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.taxResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              taxId: 1
            })
          ).toEqual('/taxes/1');
        }));

        it('should attach an tax to the controller scope', function () {
          expect($scope.vm.tax._id).toBe(mockTax._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/taxes/client/views/view-tax.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/taxes/client/views/list-taxes.client.view.html', '');

          $state.go('taxes.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('taxes/');
          $rootScope.$digest();

          expect($location.path()).toBe('/taxes');
          expect($state.current.templateUrl).toBe(
            '/modules/taxes/client/views/list-taxes.client.view.html'
          );
        }));
      });
    });
  });
})();
