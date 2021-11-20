(function () {
  'use strict';

  describe('FeatureDetails Admin Controller Tests', function () {
    // Initialize global variables
    var FeatureDetailsAdminController;
    var $scope;
    var $httpBackend;
    var $state;
    var Authentication;
    var FeatureDetailsService;
    var mockFeatureDetail;
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
      _FeatureDetailsService_,
      _Notification_
    ) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      FeatureDetailsService = _FeatureDetailsService_;
      Notification = _Notification_;

      // Ignore parent template get on state transitions
      $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

      // create mock featureDetail
      mockFeatureDetail = new FeatureDetailsService({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An FeatureDetail about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the FeatureDetails controller.
      FeatureDetailsAdminController = $controller('FeatureDetailsAdminController as vm', {
        $scope: $scope,
        featureDetailResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
      spyOn(Notification, 'error');
      spyOn(Notification, 'success');
    }));

    describe('vm.save() as create', function () {
      var sampleFeatureDetailPostData;

      beforeEach(function () {
        // Create a sample featureDetail object
        sampleFeatureDetailPostData = new FeatureDetailsService({
          title: 'An FeatureDetail about MEAN',
          content: 'MEAN rocks!'
        });

        $scope.vm.featureDetail = sampleFeatureDetailPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (
        FeatureDetailsService
      ) {
        // Set POST response
        $httpBackend
          .expectPOST('/api/featureDetails', sampleFeatureDetailPostData)
          .respond(mockFeatureDetail);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> FeatureDetail saved successfully!'
        });
        // Test URL redirection after the featureDetail was created
        expect($state.go).toHaveBeenCalledWith('admin.featureDetails.list');
      }));

      it('should call Notification.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('/api/featureDetails', sampleFeatureDetailPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({
          message: errorMessage,
          title: '<i class="fas fa-trash-alt"></i> FeatureDetail save error!'
        });
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock featureDetail in $scope
        $scope.vm.featureDetail = mockFeatureDetail;
      });

      it('should update a valid featureDetail', inject(function (FeatureDetailsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/featureDetails\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> FeatureDetail saved successfully!'
        });
        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('admin.featureDetails.list');
      }));

      it('should  call Notification.error if error', inject(function (FeatureDetailsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/featureDetails\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({
          message: errorMessage,
          title: '<i class="fas fa-trash-alt"></i> FeatureDetail save error!'
        });
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup featureDetails
        $scope.vm.featureDetail = mockFeatureDetail;
      });

      it('should delete the featureDetail and redirect to featureDetails', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/featureDetails\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> FeatureDetail deleted successfully!'
        });
        expect($state.go).toHaveBeenCalledWith('admin.featureDetails.list');
      });

      it('should should not delete the featureDetail and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
})();
