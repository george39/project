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
          mainstate = $state.get('admin.crafts');
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
          liststate = $state.get('admin.crafts.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/crafts/client/views/admin/list-crafts.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var CraftsAdminController;
        var mockCraft;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.crafts.create');
          $templateCache.put(
            '/modules/crafts/client/views/admin/form-craft.client.view.html',
            ''
          );

          // Create mock craft
          mockCraft = new CraftsService();

          // Initialize Controller
          CraftsAdminController = $controller('CraftsAdminController as vm', {
            $scope: $scope,
            craftResolve: mockCraft
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.craftResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/crafts/create');
        }));

        it('should attach an craft to the controller scope', function () {
          expect($scope.vm.craft._id).toBe(mockCraft._id);
          expect($scope.vm.craft._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/crafts/client/views/admin/form-craft.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var CraftsAdminController;
        var mockCraft;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.crafts.edit');
          $templateCache.put(
            '/modules/crafts/client/views/admin/form-craft.client.view.html',
            ''
          );

          // Create mock craft
          mockCraft = new CraftsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Craft about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          CraftsAdminController = $controller('CraftsAdminController as vm', {
            $scope: $scope,
            craftResolve: mockCraft
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:craftId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.craftResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              craftId: 1
            })
          ).toEqual('/admin/crafts/1/edit');
        }));

        it('should attach an craft to the controller scope', function () {
          expect($scope.vm.craft._id).toBe(mockCraft._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/crafts/client/views/admin/form-craft.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
