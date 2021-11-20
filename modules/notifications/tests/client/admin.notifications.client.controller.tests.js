(function () {
  'use strict';

  describe('Notifications Admin Controller Tests', function () {
    // Initialize global variables
    var NotificationsAdminController;
    var $scope;
    var $httpBackend;
    var $state;
    var Authentication;
    var NotificationsService;
    var mockNotification;
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
      _NotificationsService_,
      _Notification_
    ) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      NotificationsService = _NotificationsService_;
      Notification = _Notification_;

      // Ignore parent template get on state transitions
      $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

      // create mock notification
      mockNotification = new NotificationsService({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Notification about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Notifications controller.
      NotificationsAdminController = $controller('NotificationsAdminController as vm', {
        $scope: $scope,
        notificationResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
      spyOn(Notification, 'error');
      spyOn(Notification, 'success');
    }));

    describe('vm.save() as create', function () {
      var sampleNotificationPostData;

      beforeEach(function () {
        // Create a sample notification object
        sampleNotificationPostData = new NotificationsService({
          title: 'An Notification about MEAN',
          content: 'MEAN rocks!'
        });

        $scope.vm.notification = sampleNotificationPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (
        NotificationsService
      ) {
        // Set POST response
        $httpBackend
          .expectPOST('/api/notifications', sampleNotificationPostData)
          .respond(mockNotification);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> Notification saved successfully!'
        });
        // Test URL redirection after the notification was created
        expect($state.go).toHaveBeenCalledWith('admin.notifications.list');
      }));

      it('should call Notification.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('/api/notifications', sampleNotificationPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({
          message: errorMessage,
          title: '<i class="fas fa-trash-alt"></i> Notification save error!'
        });
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock notification in $scope
        $scope.vm.notification = mockNotification;
      });

      it('should update a valid notification', inject(function (NotificationsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/notifications\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> Notification saved successfully!'
        });
        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('admin.notifications.list');
      }));

      it('should  call Notification.error if error', inject(function (NotificationsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/notifications\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({
          message: errorMessage,
          title: '<i class="fas fa-trash-alt"></i> Notification save error!'
        });
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup notifications
        $scope.vm.notification = mockNotification;
      });

      it('should delete the notification and redirect to notifications', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/notifications\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> Notification deleted successfully!'
        });
        expect($state.go).toHaveBeenCalledWith('admin.notifications.list');
      });

      it('should should not delete the notification and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
})();
