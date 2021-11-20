(function () {
  'use strict';

  describe('DataTypes Route Tests', function () {
    // Initialize global variables
    var $scope;
    var DataTypesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _DataTypesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      DataTypesService = _DataTypesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.dataTypes');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/dataTypes');
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
          liststate = $state.get('admin.dataTypes.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/dataTypes/client/views/admin/list-dataTypes.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var DataTypesAdminController;
        var mockDataType;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.dataTypes.create');
          $templateCache.put(
            '/modules/dataTypes/client/views/admin/form-dataType.client.view.html',
            ''
          );

          // Create mock dataType
          mockDataType = new DataTypesService();

          // Initialize Controller
          DataTypesAdminController = $controller('DataTypesAdminController as vm', {
            $scope: $scope,
            dataTypeResolve: mockDataType
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.dataTypeResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/dataTypes/create');
        }));

        it('should attach an dataType to the controller scope', function () {
          expect($scope.vm.dataType._id).toBe(mockDataType._id);
          expect($scope.vm.dataType._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/dataTypes/client/views/admin/form-dataType.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var DataTypesAdminController;
        var mockDataType;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.dataTypes.edit');
          $templateCache.put(
            '/modules/dataTypes/client/views/admin/form-dataType.client.view.html',
            ''
          );

          // Create mock dataType
          mockDataType = new DataTypesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An DataType about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          DataTypesAdminController = $controller('DataTypesAdminController as vm', {
            $scope: $scope,
            dataTypeResolve: mockDataType
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:dataTypeId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.dataTypeResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              dataTypeId: 1
            })
          ).toEqual('/admin/dataTypes/1/edit');
        }));

        it('should attach an dataType to the controller scope', function () {
          expect($scope.vm.dataType._id).toBe(mockDataType._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/dataTypes/client/views/admin/form-dataType.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
