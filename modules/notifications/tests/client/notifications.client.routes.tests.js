(function () {
  'use strict';

  describe('Notifications Route Tests', function () {
    // Initialize global variables
    var $scope;
    var NotificationsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _NotificationsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      NotificationsService = _NotificationsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('notifications');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/notifications');
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
          liststate = $state.get('notifications.list');
        }));

        it('Should have the correct URL', function () {
          expect(liststate.url).toEqual('');
        });

        it('Should not be abstract', function () {
          expect(liststate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(liststate.templateUrl).toBe(
            '/modules/notifications/client/views/list-notifications.client.view.html'
          );
        });
      });

      describe('View Route', function () {
        var viewstate;
        var NotificationsController;
        var mockNotification;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('notifications.view');
          $templateCache.put('/modules/notifications/client/views/view-notification.client.view.html', '');

          // create mock notification
          mockNotification = new NotificationsService({
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Notification about MEAN',
            content: 'MEAN rocks!'
          });

          // Initialize Controller
          NotificationsController = $controller('NotificationsController as vm', {
            $scope: $scope,
            notificationResolve: mockNotification
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:notificationId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.notificationResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect(
            $state.href(viewstate, {
              notificationId: 1
            })
          ).toEqual('/notifications/1');
        }));

        it('should attach an notification to the controller scope', function () {
          expect($scope.vm.notification._id).toBe(mockNotification._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe(
            '/modules/notifications/client/views/view-notification.client.view.html'
          );
        });
      });

      describe('Handle Trailing Slash', function () {
        beforeEach(inject(function ($state, $rootScope, $templateCache) {
          $templateCache.put('/modules/notifications/client/views/list-notifications.client.view.html', '');

          $state.go('notifications.list');
          $rootScope.$digest();
        }));

        it('Should remove trailing slash', inject(function ($state, $location, $rootScope) {
          $location.path('notifications/');
          $rootScope.$digest();

          expect($location.path()).toBe('/notifications');
          expect($state.current.templateUrl).toBe(
            '/modules/notifications/client/views/list-notifications.client.view.html'
          );
        }));
      });
    });
  });
})();
