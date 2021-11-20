(function () {
  'use strict';

  describe('Langs Route Tests', function () {
    // Initialize global variables
    var $scope;
    var LangsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _LangsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      LangsService = _LangsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('langs');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/langs');
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
          liststate = $state.get('langs.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/langs/client/views/list-langs.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var LangsController;
        var mockLang;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('langs.view');
          $templateCache.put('/modules/langs/client/views/view-lang.client.view.html', '');

          // create mock lang
          mockLang = new LangsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Lang about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          LangsController = $controller('LangsController as vm', {
            $scope: $scope,
            langResolve: mockLang
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:langId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.langResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              langId: 1
            })
          ).toEqual('/langs/1');
        }));

        it('should attach an lang to the controller scope', function () {
          expect($scope.vm.lang._id).toBe(mockLang._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/langs/client/views/view-lang.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/langs/client/views/list-langs.client.view.html', '');

          $state.go('langs.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('langs/');
          $rootScope.$digest();

          expect($location.path()).toBe('/langs');
          expect($state.current.templateUrl).toBe(
            '/modules/langs/client/views/list-langs.client.view.html'
          );
        }));
      });
    });
  });
})();
