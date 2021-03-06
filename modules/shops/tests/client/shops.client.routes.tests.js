(function () {
  'use strict';

  describe('Shops Route Tests', function () {
    // Initialize global variables
    var $scope;
    var ShopsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ShopsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ShopsService = _ShopsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('shops');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/shops');
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
          liststate = $state.get('shops.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/shops/client/views/list-shops.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var ShopsController;
        var mockShop;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('shops.view');
          $templateCache.put('/modules/shops/client/views/view-shop.client.view.html', '');

          // create mock shop
          mockShop = new ShopsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Shop about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          ShopsController = $controller('ShopsController as vm', {
            $scope: $scope,
            shopResolve: mockShop
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:shopId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.shopResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              shopId: 1
            })
          ).toEqual('/shops/1');
        }));

        it('should attach an shop to the controller scope', function () {
          expect($scope.vm.shop._id).toBe(mockShop._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/shops/client/views/view-shop.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/shops/client/views/list-shops.client.view.html', '');

          $state.go('shops.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('shops/');
          $rootScope.$digest();

          expect($location.path()).toBe('/shops');
          expect($state.current.templateUrl).toBe(
            '/modules/shops/client/views/list-shops.client.view.html'
          );
        }));
      });
    });
  });
})();
