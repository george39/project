(function () {
  'use strict';

  describe('Groups Admin Controller Tests', function () {
    // Initialize global variables
    var GroupsAdminController;
    var $scope;
    var $httpBackend;
    var $state;
    var Authentication;
    var GroupsService;
    var mockGroup;
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
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _GroupsService_, _Notification_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      GroupsService = _GroupsService_;
      Notification = _Notification_;

      // Ignore parent template get on state transitions
      $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

      // create mock group
      mockGroup = new GroupsService({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Group about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Groups controller.
      GroupsAdminController = $controller('GroupsAdminController as vm', {
        $scope: $scope,
        groupResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
      spyOn(Notification, 'error');
      spyOn(Notification, 'success');
    }));

    describe('vm.save() as create', function () {
      var sampleGroupPostData;

      beforeEach(function () {
        // Create a sample group object
        sampleGroupPostData = new GroupsService({
          title: 'An Group about MEAN',
          content: 'MEAN rocks!'
        });

        $scope.vm.group = sampleGroupPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (GroupsService) {
        // Set POST response
        $httpBackend.expectPOST('/api/groups', sampleGroupPostData).respond(mockGroup);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({ message: '<i class="far fa-thumbs-up"></i> Group saved successfully!' });
        // Test URL redirection after the group was created
        expect($state.go).toHaveBeenCalledWith('admin.groups.list');
      }));

      it('should call Notification.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('/api/groups', sampleGroupPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({ message: errorMessage, title: '<i class="fas fa-trash-alt"></i> Group save error!' });
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock group in $scope
        $scope.vm.group = mockGroup;
      });

      it('should update a valid group', inject(function (GroupsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/groups\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({ message: '<i class="far fa-thumbs-up"></i> Group saved successfully!' });
        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('admin.groups.list');
      }));

      it('should  call Notification.error if error', inject(function (GroupsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/groups\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({ message: errorMessage, title: '<i class="fas fa-trash-alt"></i> Group save error!' });
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup groups
        $scope.vm.group = mockGroup;
      });

      it('should delete the group and redirect to groups', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/groups\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect(Notification.success).toHaveBeenCalledWith({ message: '<i class="far fa-thumbs-up"></i> Group deleted successfully!' });
        expect($state.go).toHaveBeenCalledWith('admin.groups.list');
      });

      it('should should not delete the group and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
})();
