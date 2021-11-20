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
          mainstate = $state.get('admin.managerFiles');
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
          liststate = $state.get('admin.managerFiles.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/managerFiles/client/views/admin/list-managerFiles.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var ManagerFilesAdminController;
        var mockManagerFile;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.managerFiles.create');
          $templateCache.put(
            '/modules/managerFiles/client/views/admin/form-managerFile.client.view.html',
            ''
          );

          // Create mock managerFile
          mockManagerFile = new ManagerFilesService();

          // Initialize Controller
          ManagerFilesAdminController = $controller('ManagerFilesAdminController as vm', {
            $scope: $scope,
            managerFileResolve: mockManagerFile
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.managerFileResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/managerFiles/create');
        }));

        it('should attach an managerFile to the controller scope', function () {
          expect($scope.vm.managerFile._id).toBe(mockManagerFile._id);
          expect($scope.vm.managerFile._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/managerFiles/client/views/admin/form-managerFile.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var ManagerFilesAdminController;
        var mockManagerFile;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.managerFiles.edit');
          $templateCache.put(
            '/modules/managerFiles/client/views/admin/form-managerFile.client.view.html',
            ''
          );

          // Create mock managerFile
          mockManagerFile = new ManagerFilesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An ManagerFile about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ManagerFilesAdminController = $controller('ManagerFilesAdminController as vm', {
            $scope: $scope,
            managerFileResolve: mockManagerFile
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:managerFileId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.managerFileResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              managerFileId: 1
            })
          ).toEqual('/admin/managerFiles/1/edit');
        }));

        it('should attach an managerFile to the controller scope', function () {
          expect($scope.vm.managerFile._id).toBe(mockManagerFile._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/managerFiles/client/views/admin/form-managerFile.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
