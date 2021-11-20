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
          mainstate = $state.get('features');
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
          liststate = $state.get('features.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/features/client/views/list-features.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var FeaturesController;
        var mockFeature;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('features.view');
          $templateCache.put('/modules/features/client/views/view-feature.client.view.html', '');

          // create mock feature
          mockFeature = new FeaturesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Feature about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          FeaturesController = $controller('FeaturesController as vm', {
            $scope: $scope,
            featureResolve: mockFeature
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:featureId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.featureResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              featureId: 1
            })
          ).toEqual('/features/1');
        }));

        it('should attach an feature to the controller scope', function () {
          expect($scope.vm.feature._id).toBe(mockFeature._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/features/client/views/view-feature.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/features/client/views/list-features.client.view.html', '');

          $state.go('features.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('features/');
          $rootScope.$digest();

          expect($location.path()).toBe('/features');
          expect($state.current.templateUrl).toBe(
            '/modules/features/client/views/list-features.client.view.html'
          );
        }));
      });
    });
  });
})();
