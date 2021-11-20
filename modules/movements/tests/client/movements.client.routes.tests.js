(function () {
  'use strict';

  describe('Movements Route Tests', function () {
    // Initialize global variables
    var $scope;
    var MovementsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _MovementsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      MovementsService = _MovementsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('movements');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/movements');
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
          liststate = $state.get('movements.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/movements/client/views/list-movements.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var MovementsController;
        var mockMovement;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('movements.view');
          $templateCache.put('/modules/movements/client/views/view-movement.client.view.html', '');

          // create mock movement
          mockMovement = new MovementsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Movement about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          MovementsController = $controller('MovementsController as vm', {
            $scope: $scope,
            movementResolve: mockMovement
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:movementId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.movementResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              movementId: 1
            })
          ).toEqual('/movements/1');
        }));

        it('should attach an movement to the controller scope', function () {
          expect($scope.vm.movement._id).toBe(mockMovement._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/movements/client/views/view-movement.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/movements/client/views/list-movements.client.view.html', '');

          $state.go('movements.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('movements/');
          $rootScope.$digest();

          expect($location.path()).toBe('/movements');
          expect($state.current.templateUrl).toBe(
            '/modules/movements/client/views/list-movements.client.view.html'
          );
        }));
      });
    });
  });
})();
