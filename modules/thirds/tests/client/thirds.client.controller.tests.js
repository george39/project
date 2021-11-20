(function () {
  'use strict';

  describe('Thirds Controller Tests', function () {
    // Initialize global variables
    var ThirdsController;
    var $scope;
    var $httpBackend;
    var $state;
    var Authentication;
    var ThirdsService;
    var mockThird;

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
      _ThirdsService_
    ) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      ThirdsService = _ThirdsService_;

      // create mock third
      mockThird = new ThirdsService({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Third about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Thirds controller.
      ThirdsController = $controller('ThirdsController as vm', {
        $scope: $scope,
        thirdResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));
  });
})();
