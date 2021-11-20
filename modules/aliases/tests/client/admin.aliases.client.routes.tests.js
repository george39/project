(function () {
  'use strict';

  describe('Aliases Route Tests', function () {
    // Initialize global variables
    var $scope;
    var AliasesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _AliasesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      AliasesService = _AliasesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('admin.aliases');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/aliases');
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
          liststate = $state.get('admin.aliases.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should be not abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/aliases/client/views/admin/list-aliases.client.view.html'
          );
        });
      });

      describe('Create Route', function () {
        var createstate;
        var AliasesAdminController;
        var mockAlias;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('admin.aliases.create');
          $templateCache.put(
            '/modules/aliases/client/views/admin/form-alias.client.view.html',
            ''
          );

          // Create mock alias
          mockAlias = new AliasesService();

          // Initialize Controller
          AliasesAdminController = $controller('AliasesAdminController as vm', {
            $scope: $scope,
            aliasResolve: mockAlias
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.aliasResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/admin/aliases/create');
        }));

        it('should attach an alias to the controller scope', function () {
          expect($scope.vm.alias._id).toBe(mockAlias._id);
          expect($scope.vm.alias._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe(
            '/modules/aliases/client/views/admin/form-alias.client.view.html'
          );
        });
      });

      describe('Edit Route', function () {
        var editstate;
        var AliasesAdminController;
        var mockAlias;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('admin.aliases.edit');
          $templateCache.put(
            '/modules/aliases/client/views/admin/form-alias.client.view.html',
            ''
          );

          // Create mock alias
          mockAlias = new AliasesService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Alias about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          AliasesAdminController = $controller('AliasesAdminController as vm', {
            $scope: $scope,
            aliasResolve: mockAlias
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:aliasId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.aliasResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(editstate, {
              aliasId: 1
            })
          ).toEqual('/admin/aliases/1/edit');
        }));

        it('should attach an alias to the controller scope', function () {
          expect($scope.vm.alias._id).toBe(mockAlias._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe(
            '/modules/aliases/client/views/admin/form-alias.client.view.html'
          );
        });

        xit('Should go to unauthorized route', function () {});
      });
    });
  });
})();
