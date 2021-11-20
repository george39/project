(function () {
  'use strict';

  describe('Thirds Route Tests', function () {
    // Initialize global variables
    var $scope;
    var ThirdsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ThirdsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ThirdsService = _ThirdsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.thirds');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/thirds');
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
          liststate = $state.get('admin.thirds.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/thirds/client/views/admin/list-thirds.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var ThirdsAdminController;
        var mockThird;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.thirds.create');
          $templateCache.put(
            '/modules/thirds/client/views/admin/form-third.client.view.html',
            ''
          );

          // Create mock third
          mockThird = new ThirdsService();

          // Initialize Controller
          ThirdsAdminController = $controller('ThirdsAdminController as vm', {
            $scope: $scope,
            thirdResolve: mockThird
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.thirdResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/thirds/create');
        }));

        it('should attach an third to the controller scope', function () {
          expect($scope.vm.third._id).toBe(mockThird._id);
          expect($scope.vm.third._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/thirds/client/views/admin/form-third.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var ThirdsAdminController;
        var mockThird;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.thirds.edit');
          $templateCache.put(
            '/modules/thirds/client/views/admin/form-third.client.view.html',
            ''
          );

          // Create mock third
          mockThird = new ThirdsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Third about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ThirdsAdminController = $controller('ThirdsAdminController as vm', {
            $scope: $scope,
            thirdResolve: mockThird
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:thirdId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.thirdResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              thirdId: 1
            })
          ).toEqual('/admin/thirds/1/edit');
        }));

        it('should attach an third to the controller scope', function () {
          expect($scope.vm.third._id).toBe(mockThird._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/thirds/client/views/admin/form-third.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
