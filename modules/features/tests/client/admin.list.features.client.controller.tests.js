(function () {
  'use strict';

  describe('Admin Features List Controller Tests', function () {
    // Initialize global variables
    var FeaturesAdminListController;
    var $scope;
    var $httpBackend;
    var $state;
    var Authentication;
    var FeaturesService;
    var mockFeature;

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
      _FeaturesService_
    ) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      FeaturesService = _FeaturesService_;

      // Ignore parent template get on state transitions
      $httpBackend
        .whenGET('/modules/features/client/views/list-features.client.view.html')
        .respond(200, '');
      $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

      // create mock feature
      mockFeature = new FeaturesService({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Feature about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user', 'admin']
      };

      // Initialize the Features List controller.
      FeaturesAdminListController = $controller('FeaturesAdminListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockFeatureList;

      beforeEach(function () {
        mockFeatureList = [mockFeature, mockFeature];
      });

      it('should send a GET request and return all features', inject(function (FeaturesService) {
        // Set POST response
        $httpBackend.expectGET('/api/features').respond(mockFeatureList);
        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.features.length).toEqual(2);
        expect($scope.vm.features[0]).toEqual(mockFeature);
        expect($scope.vm.features[1]).toEqual(mockFeature);
      }));
    });
  });
})();
