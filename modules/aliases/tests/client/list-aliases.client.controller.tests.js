(function () {
  'use strict';

  describe('Aliases List Controller Tests', function () {
    // Initialize global variables
    var AliasesListController;
    var $scope;
    var $httpBackend;
    var $state;
    var Authentication;
    var AliasesService;
    var mockAlias;

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
      _AliasesService_
    ) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      AliasesService = _AliasesService_;

      // create mock alias
      mockAlias = new AliasesService({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Alias about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Aliases List controller.
      AliasesListController = $controller('AliasesListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockAliasList;

      beforeEach(function () {
        mockAliasList = [mockAlias, mockAlias];
      });

      it('should send a GET request and return all aliases', inject(function (AliasesService) {
        // Set POST response
        $httpBackend.expectGET('/api/aliases').respond(mockAliasList);

        // Ignore parent template get on state transition
        $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.aliases.length).toEqual(2);
        expect($scope.vm.aliases[0]).toEqual(mockAlias);
        expect($scope.vm.aliases[1]).toEqual(mockAlias);
      }));
    });
  });
})();
