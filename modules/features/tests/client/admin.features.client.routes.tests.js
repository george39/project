(function () {
  'use strict';

  describe('Features Route Tests', function () {
    // Initialize global variables
    var $scope;
    var FeaturesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _FeaturesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      FeaturesService = _FeaturesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.features');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/features');
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
          liststate = $state.get('admin.features.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/features/client/views/admin/list-features.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var FeaturesAdminController;
        var mockFeature;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.features.create');
          $templateCache.put(
            '/modules/features/client/views/admin/form-feature.client.view.html',
            ''
          );

          // Create mock feature
          mockFeature = new FeaturesService();

          // Initialize Controller
          FeaturesAdminController = $controller('FeaturesAdminController as vm', {
            $scope: $scope,
            featureResolve: mockFeature
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.featureResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/features/create');
        }));

        it('should attach an feature to the controller scope', function () {
          expect($scope.vm.feature._id).toBe(mockFeature._id);
          expect($scope.vm.feature._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/features/client/views/admin/form-feature.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var FeaturesAdminController;
        var mockFeature;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.features.edit');
          $templateCache.put(
            '/modules/features/client/views/admin/form-feature.client.view.html',
            ''
          );

          // Create mock feature
          mockFeature = new FeaturesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Feature about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          FeaturesAdminController = $controller('FeaturesAdminController as vm', {
            $scope: $scope,
            featureResolve: mockFeature
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:featureId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.featureResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              featureId: 1
            })
          ).toEqual('/admin/features/1/edit');
        }));

        it('should attach an feature to the controller scope', function () {
          expect($scope.vm.feature._id).toBe(mockFeature._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/features/client/views/admin/form-feature.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
