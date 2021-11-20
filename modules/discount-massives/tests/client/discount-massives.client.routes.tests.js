(function () {
  'use strict';

  describe('DiscountMassives Route Tests', function () {
    // Initialize global variables
    var $scope;
    var DiscountMassivesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _DiscountMassivesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      DiscountMassivesService = _DiscountMassivesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('discountMassives');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/discountMassives');
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
          liststate = $state.get('discountMassives.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/discountMassives/client/views/list-discountMassives.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var DiscountMassivesController;
        var mockDiscountMassive;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('discountMassives.view');
          $templateCache.put('/modules/discountMassives/client/views/view-discountMassive.client.view.html', '');

          // create mock discountMassive
          mockDiscountMassive = new DiscountMassivesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An DiscountMassive about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          DiscountMassivesController = $controller('DiscountMassivesController as vm', {
            $scope: $scope,
            discountMassiveResolve: mockDiscountMassive
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:discountMassiveId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.discountMassiveResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              discountMassiveId: 1
            })
          ).toEqual('/discountMassives/1');
        }));

        it('should attach an discountMassive to the controller scope', function () {
          expect($scope.vm.discountMassive._id).toBe(mockDiscountMassive._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/discountMassives/client/views/view-discountMassive.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/discountMassives/client/views/list-discountMassives.client.view.html', '');

          $state.go('discountMassives.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('discountMassives/');
          $rootScope.$digest();

          expect($location.path()).toBe('/discountMassives');
          expect($state.current.templateUrl).toBe(
            '/modules/discountMassives/client/views/list-discountMassives.client.view.html'
          );
        }));
      });
    });
  });
})();
