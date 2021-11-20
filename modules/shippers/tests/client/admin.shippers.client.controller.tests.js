(function () {
  'use strict';

  describe('Shippers Admin Controller Tests', function () {
    // Initialize global variables
    var ShippersAdminController;
    var $scope;
    var $httpBackend;
    var $state;
    var Authentication;
    var ShippersService;
    var mockShipper;
    var Notification;

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
      _ShippersService_,
      _Notification_
    ) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      ShippersService = _ShippersService_;
      Notification = _Notification_;

      // Ignore parent template get on state transitions
      $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

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

      // Initialize the Shippers controller.
      ShippersAdminController = $controller('ShippersAdminController as vm', {
        $scope: $scope,
        shipperResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
      spyOn(Notification, 'error');
      spyOn(Notification, 'success');
    }));

    describe('vm.save() as create', function () {
      var sampleShipperPostData;

      beforeEach(function () {
        // Create a sample shipper object
        sampleShipperPostData = new ShippersService({
          title: 'An Shipper about MEAN',
          content: 'MEAN rocks!'
        });

        $scope.vm.shipper = sampleShipperPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (
        ShippersService
      ) {
        // Set POST response
        $httpBackend
          .expectPOST('/api/shippers', sampleShipperPostData)
          .respond(mockShipper);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> Shipper saved successfully!'
        });
        // Test URL redirection after the shipper was created
        expect($state.go).toHaveBeenCalledWith('admin.shippers.list');
      }));

      it('should call Notification.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('/api/shippers', sampleShipperPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({
          message: errorMessage,
          title: '<i class="fas fa-trash-alt"></i> Shipper save error!'
        });
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock shipper in $scope
        $scope.vm.shipper = mockShipper;
      });

      it('should update a valid shipper', inject(function (ShippersService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/shippers\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> Shipper saved successfully!'
        });
        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('admin.shippers.list');
      }));

      it('should  call Notification.error if error', inject(function (ShippersService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/shippers\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({
          message: errorMessage,
          title: '<i class="fas fa-trash-alt"></i> Shipper save error!'
        });
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup shippers
        $scope.vm.shipper = mockShipper;
      });

      it('should delete the shipper and redirect to shippers', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/shippers\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> Shipper deleted successfully!'
        });
        expect($state.go).toHaveBeenCalledWith('admin.shippers.list');
      });

      it('should should not delete the shipper and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
})();
