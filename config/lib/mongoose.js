'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');
var config = require('../config');
var chalk = require('chalk');
var path = require('path');
var mongoose = require('mongoose');

// mongoose middleware
var mongooseMiddleware = require('mongoose-middleware');
mongooseMiddleware.initialize(mongoose);

// Load the mongoose models
module.exports.loadModels = function (callback) {
  // Globbing model files
  config.files.server.models.forEach(function (modelPath) {
    require(path.resolve(modelPath));
  });

  if (callback) callback();
};

// Initialize Mongoose
module.exports.connect = function (callback) {
  mongoose.Promise = config.db.promise;

  var options = _.merge(config.db.options || {}, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  });

  mongoose
    .connect(config.db.uri, options)
    .then(function (connection) {
      // Enabling mongoose debug mode if required
      mongoose.set('debug', config.db.debug);

      // Call callback FN
      if (callback) callback(connection.db);
    })
    .catch(function (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.log(err);
    });
};

module.exports.disconnect = function (cb) {
  mongoose.connection.client.close(function (err) {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    return cb(err);
  });
};
