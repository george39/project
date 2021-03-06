(function () {
  'use strict';

  describe('DiscountLists Route Tests', function () {
    // Initialize global variables
    var $scope;
    var DiscountListsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _DiscountListsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      DiscountListsService = _DiscountListsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.discountLists');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/discountLists');
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
          liststate = $state.get('admin.discountLists.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/discountLists/client/views/admin/list-discountLists.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var DiscountListsAdminController;
        var mockDiscountList;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.discountLists.create');
          $templateCache.put(
            '/modules/discountLists/client/views/admin/form-discountList.client.view.html',
            ''
          );

          // Create mock discountList
          mockDiscountList = new DiscountListsService();

          // Initialize Controller
          DiscountListsAdminController = $controller('DiscountListsAdminController as vm', {
            $scope: $scope,
            discountListResolve: mockDiscountList
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.discountListResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/discountLists/create');
        }));

        it('should attach an discountList to the controller scope', function () {
          expect($scope.vm.discountList._id).toBe(mockDiscountList._id);
          expect($scope.vm.discountList._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/discountLists/client/views/admin/form-discountList.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var DiscountListsAdminController;
        var mockDiscountList;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.discountLists.edit');
          $templateCache.put(
            '/modules/discountLists/client/views/admin/form-discountList.client.view.html',
            ''
          );

          // Create mock discountList
          mockDiscountList = new DiscountListsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An DiscountList about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          DiscountListsAdminController = $controller('DiscountListsAdminController as vm', {
            $scope: $scope,
            discountListResolve: mockDiscountList
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:discountListId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.discountListResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              discountListId: 1
            })
          ).toEqual('/admin/discountLists/1/edit');
        }));

        it('should attach an discountList to the controller scope', function () {
          expect($scope.vm.discountList._id).toBe(mockDiscountList._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/discountLists/client/views/admin/form-discountList.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
