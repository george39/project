'use strict';

/**
 * Module dependencies
 */
const favoritesPolicy = require('../policies/favorites.server.policy');
const favorites = require('../controllers/favorites.server.controller');

module.exports = function (app) {
  // Favorites collection routes
  app
    .route('/api/favorites')
    .all(favoritesPolicy.isAllowed)
    .get(favorites.list)
    .post(favorites.create);

  // Favorites findAll route
  app.route('/api/favorites/findAll').all(favoritesPolicy.isAllowed).get(favorites.findAll);
  app.route('/api/favorites/findOne').all(favoritesPolicy.isAllowed).get(favorites.findOne);
  app.route('/api/favorites/delete').all(favoritesPolicy.isAllowed).delete(favorites.delete);

  // Single Favorite routes
  app
    .route('/api/favorites/:favoriteId')
    .all(favoritesPolicy.isAllowed)
    .get(favorites.read)
    .put(favorites.update);

  // Finish by binding the Favorite middleware
  app.param('favoriteId', favorites.favoriteByID);
};

