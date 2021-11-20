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
          mainstate = $state.get('admin.movements');
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
          liststate = $state.get('admin.movements.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/movements/client/views/admin/list-movements.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var MovementsAdminController;
        var mockMovement;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.movements.create');
          $templateCache.put(
            '/modules/movements/client/views/admin/form-movement.client.view.html',
            ''
          );

          // Create mock movement
          mockMovement = new MovementsService();

          // Initialize Controller
          MovementsAdminController = $controller('MovementsAdminController as vm', {
            $scope: $scope,
            movementResolve: mockMovement
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.movementResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/movements/create');
        }));

        it('should attach an movement to the controller scope', function () {
          expect($scope.vm.movement._id).toBe(mockMovement._id);
          expect($scope.vm.movement._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/movements/client/views/admin/form-movement.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var MovementsAdminController;
        var mockMovement;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.movements.edit');
          $templateCache.put(
            '/modules/movements/client/views/admin/form-movement.client.view.html',
            ''
          );

          // Create mock movement
          mockMovement = new MovementsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Movement about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          MovementsAdminController = $controller('MovementsAdminController as vm', {
            $scope: $scope,
            movementResolve: mockMovement
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:movementId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.movementResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              movementId: 1
            })
          ).toEqual('/admin/movements/1/edit');
        }));

        it('should attach an movement to the controller scope', function () {
          expect($scope.vm.movement._id).toBe(mockMovement._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/movements/client/views/admin/form-movement.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
