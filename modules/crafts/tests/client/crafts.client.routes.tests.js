(function () {
  'use strict';

  describe('Crafts Route Tests', function () {
    // Initialize global variables
    var $scope;
    var CraftsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CraftsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CraftsService = _CraftsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('crafts');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/crafts');
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
          liststate = $state.get('crafts.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/crafts/client/views/list-crafts.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var CraftsController;
        var mockCraft;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('crafts.view');
          $templateCache.put('/modules/crafts/client/views/view-craft.client.view.html', '');

          // create mock craft
          mockCraft = new CraftsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Craft about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          CraftsController = $controller('CraftsController as vm', {
            $scope: $scope,
            craftResolve: mockCraft
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:craftId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.craftResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              craftId: 1
            })
          ).toEqual('/crafts/1');
        }));

        it('should attach an craft to the controller scope', function () {
          expect($scope.vm.craft._id).toBe(mockCraft._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/crafts/client/views/view-craft.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/crafts/client/views/list-crafts.client.view.html', '');

          $state.go('crafts.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('crafts/');
          $rootScope.$digest();

          expect($location.path()).toBe('/crafts');
          expect($state.current.templateUrl).toBe(
            '/modules/crafts/client/views/list-crafts.client.view.html'
          );
        }));
      });
    });
  });
})();
