'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var Feature = mongoose.model('Feature');
var errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Feature
 */
exports.create = function (req, res) {
  var feature = new Feature(req.body);
  feature.user = req.user._id;
  feature.shop = req.user.shop;

  feature.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(feature);
    }
  });
};

/**
 * Show the current Feature
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var feature = req.feature ? req.feature.toJSON() : {};

  // Add a custom field to the Feature, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Feature model.
  feature.isCurrentUserOwner = !!(
    req.user &&
    feature.user &&
    feature.user._id.toString() === req.user._id.toString()
  );

  res.json(feature);
};

/**
 * Update an Feature
 */
exports.update = function (req, res) {
  var feature = req.feature;

  feature.nameLang = req.body.nameLang;
  feature.typeFeature_id = req.body.typeFeature_id;
  feature.order = req.body.order;
  feature.status = req.body.status;
  feature.modifiedBy = req.user._id;
  feature.modified = Date();

  feature.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(feature);
    }
  });
};

/**
 * Delete an Feature
 */
exports.delete = function (req, res) {
  var feature = req.feature;

  feature.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(feature);
    }
  });
};

/**
 * List of Features
 */
exports.list = function (req, res) {
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Feature().processFilter(filter);
  var processPopulate = new Feature().processPopulate(populate);
  // var processSort = new Feature().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.shop = req.user.shop;
  }

  var options = {
    filters: {
      field: req.query.field || '',
      mandatory: {
        contains: processFilter
      }
    },
    sort: sort,
    start: (page - 1) * count,
    count: count
  };

  Feature.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, features) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(features);
      }
    });
};

/**
 * Feature middleware
 */
exports.featureByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Feature is invalid'
    });
  }

  Feature.findById(id)
    .populate({ path: 'modifiedBy', select: ['displayName'] })
    .populate({ path: 'user', select: ['displayName'] })
    .populate({ path: 'typeFeature_id', select: ['nameLang'] })
    .populate({ path: 'shop', select: ['name'] })
    .exec(function (err, feature) {
      if (err) {
        return next(err);
      } else if (!feature) {
        return res.status(404).send({
          message: 'No feature with that identifier has been found'
        });
      }
      req.feature = feature;
      next();
    });
};

/**
 * Feature findAll
 */
exports.findAll = function (req, res) {
  var sort = req.query.sort || { modified: -1 };
  var filter = req.query.filter || {};

  var processFilter = new Feature().processFilter(filter);
  var processSort = new Feature().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter['shop._id'] = req.user.shop;
  }

  Feature.aggregate()
    .lookup({
      from: 'datatypes',
      let: { typeFeature_id: '$typeFeature_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$typeFeature_id']
            }
          }
        },
        {
          $project: {
            nameLang: 1
          }
        }
      ],
      as: 'typeFeature_id'
    })
    .unwind({ path: '$typeFeature_id', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'shops',
      let: { shop: '$shop' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$shop']
            }
          }
        },
        {
          $project: {
            name: 1
          }
        }
      ],
      as: 'shop'
    })
    .unwind({ path: '$shop', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'users',
      let: { user: '$user' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$user']
            }
          }
        },
        {
          $project: {
            displayName: 1
          }
        }
      ],
      as: 'user'
    })
    .unwind({ path: '$user', preserveNullAndEmptyArrays: true })
    .match(processFilter)
    .sort(processSort)
    .exec(function (err, results) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(results);
      }
    });
};
