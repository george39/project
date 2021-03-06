(function () {
  'use strict';

  describe('ManagerConfigurations Route Tests', function () {
    // Initialize global variables
    var $scope;
    var ManagerConfigurationsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ManagerConfigurationsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ManagerConfigurationsService = _ManagerConfigurationsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.managerConfigurations');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/managerConfigurations');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('List Route', function () {
        var liststate;
        beforeEach(inject(function ($state) {
          liststate = $state.get('admin.managerConfigurations.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/managerConfigurations/client/views/admin/list-managerConfigurations.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var ManagerConfigurationsAdminController;
        var mockManagerConfiguration;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.managerConfigurations.create');
          $templateCache.put(
            '/modules/managerConfigurations/client/views/admin/form-managerConfiguration.client.view.html',
            ''
          );

          // Create mock managerConfiguration
          mockManagerConfiguration = new ManagerConfigurationsService();

          // Initialize Controller
          ManagerConfigurationsAdminController = $controller('ManagerConfigurationsAdminController as vm', {
            $scope: $scope,
            managerConfigurationResolve: mockManagerConfiguration
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.managerConfigurationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/managerConfigurations/create');
        }));

        it('should attach an managerConfiguration to the controller scope', function () {
          expect($scope.vm.managerConfiguration._id).toBe(mockManagerConfiguration._id);
          expect($scope.vm.managerConfiguration._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/managerConfigurations/client/views/admin/form-managerConfiguration.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var ManagerConfigurationsAdminController;
        var mockManagerConfiguration;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.managerConfigurations.edit');
          $templateCache.put(
            '/modules/managerConfigurations/client/views/admin/form-managerConfiguration.client.view.html',
            ''
          );

          // Create mock managerConfiguration
          mockManagerConfiguration = new ManagerConfigurationsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An ManagerConfiguration about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ManagerConfigurationsAdminController = $controller('ManagerConfigurationsAdminController as vm', {
            $scope: $scope,
            managerConfigurationResolve: mockManagerConfiguration
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:managerConfigurationId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.managerConfigurationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              managerConfigurationId: 1
            })
          ).toEqual('/admin/managerConfigurations/1/edit');
        }));

        it('should attach an managerConfiguration to the controller scope', function () {
          expect($scope.vm.managerConfiguration._id).toBe(mockManagerConfiguration._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/managerConfigurations/client/views/admin/form-managerConfiguration.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
