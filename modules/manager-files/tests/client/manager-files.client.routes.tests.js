(function () {
  'use strict';

  describe('ManagerFiles Route Tests', function () {
    // Initialize global variables
    var $scope;
    var ManagerFilesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ManagerFilesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ManagerFilesService = _ManagerFilesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('managerFiles');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/managerFiles');
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
          liststate = $state.get('managerFiles.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/managerFiles/client/views/list-managerFiles.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var ManagerFilesController;
        var mockManagerFile;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('managerFiles.view');
          $templateCache.put('/modules/managerFiles/client/views/view-managerFile.client.view.html', '');

          // create mock managerFile
          mockManagerFile = new ManagerFilesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An ManagerFile about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ManagerFilesController = $controller('ManagerFilesController as vm', {
            $scope: $scope,
            managerFileResolve: mockManagerFile
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:managerFileId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.managerFileResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              managerFileId: 1
            })
          ).toEqual('/managerFiles/1');
        }));

        it('should attach an managerFile to the controller scope', function () {
          expect($scope.vm.managerFile._id).toBe(mockManagerFile._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/managerFiles/client/views/view-managerFile.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/managerFiles/client/views/list-managerFiles.client.view.html', '');

          $state.go('managerFiles.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('managerFiles/');
          $rootScope.$digest();

          expect($location.path()).toBe('/managerFiles');
          expect($state.current.templateUrl).toBe(
            '/modules/managerFiles/client/views/list-managerFiles.client.view.html'
          );
        }));
      });
    });
  });
})();
