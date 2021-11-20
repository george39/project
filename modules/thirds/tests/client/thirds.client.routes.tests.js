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
          mainstate = $state.get('thirds');
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
          liststate = $state.get('thirds.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/thirds/client/views/list-thirds.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var ThirdsController;
        var mockThird;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('thirds.view');
          $templateCache.put('/modules/thirds/client/views/view-third.client.view.html', '');

          // create mock third
          mockThird = new ThirdsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Third about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ThirdsController = $controller('ThirdsController as vm', {
            $scope: $scope,
            thirdResolve: mockThird
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:thirdId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.thirdResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              thirdId: 1
            })
          ).toEqual('/thirds/1');
        }));

        it('should attach an third to the controller scope', function () {
          expect($scope.vm.third._id).toBe(mockThird._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/thirds/client/views/view-third.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/thirds/client/views/list-thirds.client.view.html', '');

          $state.go('thirds.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('thirds/');
          $rootScope.$digest();

          expect($location.path()).toBe('/thirds');
          expect($state.current.templateUrl).toBe(
            '/modules/thirds/client/views/list-thirds.client.view.html'
          );
        }));
      });
    });
  });
})();
