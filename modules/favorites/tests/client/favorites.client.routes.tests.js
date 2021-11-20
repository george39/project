(function () {
  'use strict';

  describe('Favorites Route Tests', function () {
    // Initialize global variables
    var $scope;
    var FavoritesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _FavoritesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      FavoritesService = _FavoritesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('favorites');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/favorites');
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
          liststate = $state.get('favorites.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/favorites/client/views/list-favorites.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var FavoritesController;
        var mockFavorite;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('favorites.view');
          $templateCache.put('/modules/favorites/client/views/view-favorite.client.view.html', '');

          // create mock favorite
          mockFavorite = new FavoritesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Favorite about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          FavoritesController = $controller('FavoritesController as vm', {
            $scope: $scope,
            favoriteResolve: mockFavorite
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:favoriteId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.favoriteResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              favoriteId: 1
            })
          ).toEqual('/favorites/1');
        }));

        it('should attach an favorite to the controller scope', function () {
          expect($scope.vm.favorite._id).toBe(mockFavorite._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/favorites/client/views/view-favorite.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/favorites/client/views/list-favorites.client.view.html', '');

          $state.go('favorites.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('favorites/');
          $rootScope.$digest();

          expect($location.path()).toBe('/favorites');
          expect($state.current.templateUrl).toBe(
            '/modules/favorites/client/views/list-favorites.client.view.html'
          );
        }));
      });
    });
  });
})();
