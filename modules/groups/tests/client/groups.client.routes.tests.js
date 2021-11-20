(function () {
  'use strict';

  describe('Groups Route Tests', function () {
    // Initialize global variables
    var $scope;
    var GroupsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _GroupsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      GroupsService = _GroupsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('groups');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/groups');
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
          liststate = $state.get('groups.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe('/modules/groups/client/views/list-groups.client.view.html');
        });
      });

      describe('View Route', function () {
        var viewstate;
        var GroupsController;
        var mockGroup;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('groups.view');
          $templateCache.put('/modules/groups/client/views/view-group.client.view.html', '');

          // create mock group
          mockGroup = new GroupsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Group about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          GroupsController = $controller('GroupsController as vm', {
            $scope: $scope,
            groupResolve: mockGroup
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:groupId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.groupResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            groupId: 1
          })).toEqual('/groups/1');
        }));

        it('should attach an group to the controller scope', function () {
          expect($scope.vm.group._id).toBe(mockGroup._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('/modules/groups/client/views/view-group.client.view.html');
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/groups/client/views/list-groups.client.view.html', '');

          $state.go('groups.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('groups/');
          $rootScope.$digest();

          expect($location.path()).toBe('/groups');
          expect($state.current.templateUrl).toBe('/modules/groups/client/views/list-groups.client.view.html');
        }));
      });
    });
  });
})();
