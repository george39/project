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
          mainstate = $state.get('dataTypes');
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
          liststate = $state.get('dataTypes.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/dataTypes/client/views/list-dataTypes.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var DataTypesController;
        var mockDataType;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('dataTypes.view');
          $templateCache.put('/modules/dataTypes/client/views/view-dataType.client.view.html', '');

          // create mock dataType
          mockDataType = new DataTypesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An DataType about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          DataTypesController = $controller('DataTypesController as vm', {
            $scope: $scope,
            dataTypeResolve: mockDataType
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:dataTypeId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.dataTypeResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              dataTypeId: 1
            })
          ).toEqual('/dataTypes/1');
        }));

        it('should attach an dataType to the controller scope', function () {
          expect($scope.vm.dataType._id).toBe(mockDataType._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/dataTypes/client/views/view-dataType.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/dataTypes/client/views/list-dataTypes.client.view.html', '');

          $state.go('dataTypes.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('dataTypes/');
          $rootScope.$digest();

          expect($location.path()).toBe('/dataTypes');
          expect($state.current.templateUrl).toBe(
            '/modules/dataTypes/client/views/list-dataTypes.client.view.html'
          );
        }));
      });
    });
  });
})();
