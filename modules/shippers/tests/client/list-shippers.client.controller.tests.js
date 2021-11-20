(function () {
  'use strict';

  describe('Shippers List Controller Tests', function () {
    // Initialize global variables
    var ShippersListController;
    var $scope;
    var $httpBackend;
    var $state;
    var Authentication;
    var ShippersService;
    var mockShipper;

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
      _ShippersService_
    ) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      ShippersService = _ShippersService_;

      // create mock shipper
      mockShipper = new ShippersService({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Shipper about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Shippers List controller.
      ShippersListController = $controller('ShippersListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockShipperList;

      beforeEach(function () {
        mockShipperList = [mockShipper, mockShipper];
      });

      it('should send a GET request and return all shippers', inject(function (ShippersService) {
        // Set POST response
        $httpBackend.expectGET('/api/shippers').respond(mockShipperList);

        // Ignore parent template get on state transition
        $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.shippers.length).toEqual(2);
        expect($scope.vm.shippers[0]).toEqual(mockShipper);
        expect($scope.vm.shippers[1]).toEqual(mockShipper);
      }));
    });
  });
})();
