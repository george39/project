(function () {
  'use strict';

  describe('FeatureDetails Route Tests', function () {
    // Initialize global variables
    var $scope;
    var FeatureDetailsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _FeatureDetailsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      FeatureDetailsService = _FeatureDetailsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('featureDetails');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/featureDetails');
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
          liststate = $state.get('featureDetails.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/featureDetails/client/views/list-featureDetails.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var FeatureDetailsController;
        var mockFeatureDetail;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('featureDetails.view');
          $templateCache.put('/modules/featureDetails/client/views/view-featureDetail.client.view.html', '');

          // create mock featureDetail
          mockFeatureDetail = new FeatureDetailsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An FeatureDetail about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          FeatureDetailsController = $controller('FeatureDetailsController as vm', {
            $scope: $scope,
            featureDetailResolve: mockFeatureDetail
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:featureDetailId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.featureDetailResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              featureDetailId: 1
            })
          ).toEqual('/featureDetails/1');
        }));

        it('should attach an featureDetail to the controller scope', function () {
          expect($scope.vm.featureDetail._id).toBe(mockFeatureDetail._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/featureDetails/client/views/view-featureDetail.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/featureDetails/client/views/list-featureDetails.client.view.html', '');

          $state.go('featureDetails.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('featureDetails/');
          $rootScope.$digest();

          expect($location.path()).toBe('/featureDetails');
          expect($state.current.templateUrl).toBe(
            '/modules/featureDetails/client/views/list-featureDetails.client.view.html'
          );
        }));
      });
    });
  });
})();
