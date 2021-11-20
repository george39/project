'use strict';

/**
 * Module dependencies
 */
const chalk = require('chalk');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Favorite Schema
 */
const FavoriteSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  product: {
    type: Schema.ObjectId,
    ref: 'Product'
  },
  status: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  modified: {
    type: Date,
    default: Date.now
  }
});

FavoriteSchema.statics.seed = seed;

mongoose.model('Favorite', FavoriteSchema);

/**
 * Seeds the User collection with document (Favorite)
 * and provided options.
 */
function seed(doc, options) {
  var Favorite = mongoose.model('Favorite');

  return new Promise(function (resolve, reject) {
    skipDocument()
      .then(findAdminUser)
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function findAdminUser(skip) {
      var User = mongoose.model('User');

      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve(true);
        }

        User.findOne({
          roles: {
            $in: ['admin']
          }
        }).exec(function (err, admin) {
          if (err) {
            return reject(err);
          }

          doc.user = admin;

          return resolve();
        });
      });
    }

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Favorite.findOne({
          name: doc.name
        }).exec(function (err, existing) {
          if (err) {
            return reject(err);
          }

          if (!existing) {
            return resolve(false);
          }

          if (existing && !options.overwrite) {
            return resolve(true);
          }

          // Remove Favorite (overwrite)

          existing.remove(function (err) {
            if (err) {
              return reject(err);
            }

            return resolve(false);
          });
        });
      });
    }

    function add(skip) {
      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve({
            message: chalk.yellow('Database Seeding: Favorite\t' + doc.name + ' skipped')
          });
        }

        const favorite = new Favorite(doc);

        favorite.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Favorite\t' + favorite.name + ' added'
          });
        });
      });
    }
  });
}

