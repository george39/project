(function () {
  'use strict';

  describe('Aliases Route Tests', function () {
    // Initialize global variables
    var $scope;
    var AliasesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _AliasesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      AliasesService = _AliasesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('aliases');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/aliases');
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
          liststate = $state.get('aliases.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/aliases/client/views/list-aliases.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var AliasesController;
        var mockAlias;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('aliases.view');
          $templateCache.put('/modules/aliases/client/views/view-alias.client.view.html', '');

          // create mock alias
          mockAlias = new AliasesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Alias about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          AliasesController = $controller('AliasesController as vm', {
            $scope: $scope,
            aliasResolve: mockAlias
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:aliasId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.aliasResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              aliasId: 1
            })
          ).toEqual('/aliases/1');
        }));

        it('should attach an alias to the controller scope', function () {
          expect($scope.vm.alias._id).toBe(mockAlias._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/aliases/client/views/view-alias.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/aliases/client/views/list-aliases.client.view.html', '');

          $state.go('aliases.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('aliases/');
          $rootScope.$digest();

          expect($location.path()).toBe('/aliases');
          expect($state.current.templateUrl).toBe(
            '/modules/aliases/client/views/list-aliases.client.view.html'
          );
        }));
      });
    });
  });
})();
