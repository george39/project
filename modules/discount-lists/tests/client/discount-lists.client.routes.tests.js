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
          mainstate = $state.get('discountLists');
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
          liststate = $state.get('discountLists.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/discountLists/client/views/list-discountLists.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var DiscountListsController;
        var mockDiscountList;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('discountLists.view');
          $templateCache.put('/modules/discountLists/client/views/view-discountList.client.view.html', '');

          // create mock discountList
          mockDiscountList = new DiscountListsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An DiscountList about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          DiscountListsController = $controller('DiscountListsController as vm', {
            $scope: $scope,
            discountListResolve: mockDiscountList
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:discountListId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.discountListResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              discountListId: 1
            })
          ).toEqual('/discountLists/1');
        }));

        it('should attach an discountList to the controller scope', function () {
          expect($scope.vm.discountList._id).toBe(mockDiscountList._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/discountLists/client/views/view-discountList.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/discountLists/client/views/list-discountLists.client.view.html', '');

          $state.go('discountLists.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('discountLists/');
          $rootScope.$digest();

          expect($location.path()).toBe('/discountLists');
          expect($state.current.templateUrl).toBe(
            '/modules/discountLists/client/views/list-discountLists.client.view.html'
          );
        }));
      });
    });
  });
})();
