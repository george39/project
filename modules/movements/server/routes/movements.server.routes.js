'use strict';

/**
 * Module dependencies
 */
var movementsPolicy = require('../policies/movements.server.policy');
var movements = require('../controllers/movements.server.controller');

module.exports = function (app) {
  // Movements collection routes
  app.route('/api/movements').all(movementsPolicy.isAllowed).get(movements.list).post(movements.create);

  // Movements findAll route
  app.route('/api/movements/findAll').all(movementsPolicy.isAllowed).get(movements.findAll);

  // Movements findDetail route
  app.route('/api/movements/findDetail').all(movementsPolicy.isAllowed).get(movements.findDetail);

  // Movements findMovement route
  app.route('/api/movements/findMovement').all(movementsPolicy.isAllowed).get(movements.findMovement);

  // Single Movement routes
  app
    .route('/api/movements/:movementId')
    .all(movementsPolicy.isAllowed)
    .get(movements.read)
    .put(movements.update)
    .delete(movements.delete);

  // Finish by binding the Movement middleware
  app.param('movementId', movements.movementByID);
};
