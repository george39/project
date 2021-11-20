(function () {
  'use strict';

  describe('Categories Admin Controller Tests', function () {
    // Initialize global variables
    var CategoriesAdminController;
    var $scope;
    var $httpBackend;
    var $state;
    var Authentication;
    var CategoriesService;
    var mockCategory;
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
      _CategoriesService_,
      _Notification_
    ) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      CategoriesService = _CategoriesService_;
      Notification = _Notification_;

      // Ignore parent template get on state transitions
      $httpBackend.whenGET('/modules/core/client/views/home.client.view.html').respond(200, '');

      // create mock category
      mockCategory = new CategoriesService({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Category about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Categories controller.
      CategoriesAdminController = $controller('CategoriesAdminController as vm', {
        $scope: $scope,
        categoryResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
      spyOn(Notification, 'error');
      spyOn(Notification, 'success');
    }));

    describe('vm.save() as create', function () {
      var sampleCategoryPostData;

      beforeEach(function () {
        // Create a sample category object
        sampleCategoryPostData = new CategoriesService({
          title: 'An Category about MEAN',
          content: 'MEAN rocks!'
        });

        $scope.vm.category = sampleCategoryPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (
        CategoriesService
      ) {
        // Set POST response
        $httpBackend
          .expectPOST('/api/categories', sampleCategoryPostData)
          .respond(mockCategory);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> Category saved successfully!'
        });
        // Test URL redirection after the category was created
        expect($state.go).toHaveBeenCalledWith('admin.categories.list');
      }));

      it('should call Notification.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('/api/categories', sampleCategoryPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({
          message: errorMessage,
          title: '<i class="fas fa-trash-alt"></i> Category save error!'
        });
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock category in $scope
        $scope.vm.category = mockCategory;
      });

      it('should update a valid category', inject(function (CategoriesService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/categories\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test Notification success was called
        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> Category saved successfully!'
        });
        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('admin.categories.list');
      }));

      it('should  call Notification.error if error', inject(function (CategoriesService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/categories\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect(Notification.error).toHaveBeenCalledWith({
          message: errorMessage,
          title: '<i class="fas fa-trash-alt"></i> Category save error!'
        });
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup categories
        $scope.vm.category = mockCategory;
      });

      it('should delete the category and redirect to categories', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/categories\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect(Notification.success).toHaveBeenCalledWith({
          message: '<i class="fas fa-check"></i> Category deleted successfully!'
        });
        expect($state.go).toHaveBeenCalledWith('admin.categories.list');
      });

      it('should should not delete the category and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
})();
