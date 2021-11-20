(function () {
  'use strict';

  describe('Langs Route Tests', function () {
    // Initialize global variables
    var $scope;
    var LangsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _LangsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      LangsService = _LangsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.langs');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/langs');
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
          liststate = $state.get('admin.langs.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/langs/client/views/admin/list-langs.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var LangsAdminController;
        var mockLang;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.langs.create');
          $templateCache.put(
            '/modules/langs/client/views/admin/form-lang.client.view.html',
            ''
          );

          // Create mock lang
          mockLang = new LangsService();

          // Initialize Controller
          LangsAdminController = $controller('LangsAdminController as vm', {
            $scope: $scope,
            langResolve: mockLang
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.langResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/langs/create');
        }));

        it('should attach an lang to the controller scope', function () {
          expect($scope.vm.lang._id).toBe(mockLang._id);
          expect($scope.vm.lang._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/langs/client/views/admin/form-lang.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var LangsAdminController;
        var mockLang;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.langs.edit');
          $templateCache.put(
            '/modules/langs/client/views/admin/form-lang.client.view.html',
            ''
          );

          // Create mock lang
          mockLang = new LangsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Lang about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          LangsAdminController = $controller('LangsAdminController as vm', {
            $scope: $scope,
            langResolve: mockLang
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:langId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.langResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              langId: 1
            })
          ).toEqual('/admin/langs/1/edit');
        }));

        it('should attach an lang to the controller scope', function () {
          expect($scope.vm.lang._id).toBe(mockLang._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/langs/client/views/admin/form-lang.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
