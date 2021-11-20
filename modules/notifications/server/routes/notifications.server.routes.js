'use strict';

/**
 * Module dependencies
 */
const notificationsPolicy = require('../policies/notifications.server.policy');
const notifications = require('../controllers/notifications.server.controller');

module.exports = function (app) {
  // Notifications collection routes
  app
    .route('/api/notifications')
    .all(notificationsPolicy.isAllowed)
    .get(notifications.list)
    .post(notifications.create);

  // Notifications findAll route
  app
    .route('/api/notifications/findAll')
    .all(notificationsPolicy.isAllowed)
    .get(notifications.findAll);
  app
    .route('/api/notifications/readNotifications')
    .all(notificationsPolicy.isAllowed)
    .post(notifications.readNotifications);

  // Single Notification routes
  app
    .route('/api/notifications/:notificationId')
    .all(notificationsPolicy.isAllowed)
    .get(notifications.read)
    .put(notifications.update)
    .delete(notifications.delete);

  // Finish by binding the Notification middleware
  app.param('notificationId', notifications.notificationByID);
};
