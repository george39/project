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
          mainstate = $state.get('managerConfigurations');
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
          liststate = $state.get('managerConfigurations.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/managerConfigurations/client/views/list-managerConfigurations.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var ManagerConfigurationsController;
        var mockManagerConfiguration;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('managerConfigurations.view');
          $templateCache.put('/modules/managerConfigurations/client/views/view-managerConfiguration.client.view.html', '');

          // create mock managerConfiguration
          mockManagerConfiguration = new ManagerConfigurationsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An ManagerConfiguration about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ManagerConfigurationsController = $controller('ManagerConfigurationsController as vm', {
            $scope: $scope,
            managerConfigurationResolve: mockManagerConfiguration
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:managerConfigurationId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.managerConfigurationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              managerConfigurationId: 1
            })
          ).toEqual('/managerConfigurations/1');
        }));

        it('should attach an managerConfiguration to the controller scope', function () {
          expect($scope.vm.managerConfiguration._id).toBe(mockManagerConfiguration._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/managerConfigurations/client/views/view-managerConfiguration.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/managerConfigurations/client/views/list-managerConfigurations.client.view.html', '');

          $state.go('managerConfigurations.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('managerConfigurations/');
          $rootScope.$digest();

          expect($location.path()).toBe('/managerConfigurations');
          expect($state.current.templateUrl).toBe(
            '/modules/managerConfigurations/client/views/list-managerConfigurations.client.view.html'
          );
        }));
      });
    });
  });
})();
