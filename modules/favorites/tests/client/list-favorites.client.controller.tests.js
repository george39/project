(function () {
  'use strict';

  describe('Favorites List Controller Tests', function () {
    // Initialize global variables
    var FavoritesListController;
    var $scope;
    var $httpBackend;
    var $state;
    var Authentication;
    var FavoritesService;
    var mockFavorite;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function (
      $controller,
      $rootScope,
      _$state_,
      _$httpBackend_,
      _Authentication_,
      _FavoritesService_
    ) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      FavoritesService = _FavoritesService_;

      // create mock favorite
      mockFavorite = new FavoritesService({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Favorite about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Favorites List controller.
      FavoritesListController = $controller('FavoritesListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockFavoriteList;

      beforeEach(function () {
        mockFavoriteList = [mockFavorite, mockFavorite];
      });

      it('should send a GET request and return all favorites', inject(function (FavoritesService) {
        // Set POST response
        $httpBackend.expectGET('/api/favorites').respond(mockFavoriteList);

        // Ignore parent template get on state transition
        $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.favorites.length).toEqual(2);
        expect($scope.vm.favorites[0]).toEqual(mockFavorite);
        expect($scope.vm.favorites[1]).toEqual(mockFavorite);
      }));
    });
  });
})();
