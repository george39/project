(function () {
  'use strict';

  describe('Categories Route Tests', function () {
    // Initialize global variables
    var $scope;
    var CategoriesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CategoriesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CategoriesService = _CategoriesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.categories');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/categories');
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
          liststate = $state.get('admin.categories.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/categories/client/views/admin/list-categories.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var CategoriesAdminController;
        var mockCategory;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.categories.create');
          $templateCache.put(
            '/modules/categories/client/views/admin/form-category.client.view.html',
            ''
          );

          // Create mock category
          mockCategory = new CategoriesService();

          // Initialize Controller
          CategoriesAdminController = $controller('CategoriesAdminController as vm', {
            $scope: $scope,
            categoryResolve: mockCategory
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.categoryResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/categories/create');
        }));

        it('should attach an category to the controller scope', function () {
          expect($scope.vm.category._id).toBe(mockCategory._id);
          expect($scope.vm.category._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/categories/client/views/admin/form-category.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var CategoriesAdminController;
        var mockCategory;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.categories.edit');
          $templateCache.put(
            '/modules/categories/client/views/admin/form-category.client.view.html',
            ''
          );

          // Create mock category
          mockCategory = new CategoriesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Category about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          CategoriesAdminController = $controller('CategoriesAdminController as vm', {
            $scope: $scope,
            categoryResolve: mockCategory
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:categoryId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.categoryResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              categoryId: 1
            })
          ).toEqual('/admin/categories/1/edit');
        }));

        it('should attach an category to the controller scope', function () {
          expect($scope.vm.category._id).toBe(mockCategory._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/categories/client/views/admin/form-category.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
