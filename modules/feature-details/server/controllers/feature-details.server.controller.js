'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var FeatureDetail = mongoose.model('FeatureDetail');
var errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Feature Detail
 */
exports.create = function (req, res) {
  var featureDetail = new FeatureDetail(req.body);
  featureDetail.user = req.user._id;
  featureDetail.shop = req.user.shop;

  featureDetail.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(featureDetail);
    }
  });
};

/**
 * Show the current Feature Detail
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var featureDetail = req.featureDetail ? req.featureDetail.toJSON() : {};

  // Add a custom field to the FeatureDetail, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the FeatureDetail model.
  featureDetail.isCurrentUserOwner = !!(
    req.user &&
    featureDetail.user &&
    featureDetail.user._id.toString() === req.user._id.toString()
  );

  res.json(featureDetail);
};

/**
 * Update an Feature Detail
 */
exports.update = function (req, res) {
  var featureDetail = req.featureDetail;

  featureDetail.feature_id = req.body.feature_id;
  featureDetail.nameLang = req.body.nameLang;
  featureDetail.order = req.body.order;
  featureDetail.status = req.body.status;
  featureDetail.modifiedBy = req.user._id;
  featureDetail.modified = Date();

  featureDetail.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(featureDetail);
    }
  });
};

/**
 * Delete an Feature Detail
 */
exports.delete = function (req, res) {
  var featureDetail = req.featureDetail;

  featureDetail.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(featureDetail);
    }
  });
};

/**
 * List of Feature Details
 */
exports.list = function (req, res) {
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new FeatureDetail().processFilter(filter);
  var processPopulate = new FeatureDetail().processPopulate(populate);
  // var processSort = new FeatureDetail().processSort(sort);

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

  FeatureDetail.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, featureDetails) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(featureDetails);
      }
    });
};

/**
 * FeatureDetail middleware
 */
exports.featureDetailByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'FeatureDetail is invalid'
    });
  }

  FeatureDetail.findById(id)
    .populate({ path: 'modifiedBy', select: ['displayName'] })
    .populate({ path: 'user', select: ['displayName'] })
    .populate({ path: 'feature_id', select: ['nameLang'] })
    .populate({ path: 'shop', select: ['name'] })
    .exec(function (err, featureDetail) {
      if (err) {
        return next(err);
      } else if (!featureDetail) {
        return res.status(404).send({
          message: 'No featureDetail with that identifier has been found'
        });
      }
      req.featureDetail = featureDetail;
      next();
    });
};

/**
 * FeatureDetail findAll
 */
exports.findAll = function (req, res) {
  var sort = req.query.sorting || { modified: -1 };
  var filter = req.query.filter || {};

  var processFilter = new FeatureDetail().processFilter(filter);
  var processSort = new FeatureDetail().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter['shop._id'] = req.user.shop;
  }

  FeatureDetail.aggregate()
    .lookup({
      from: 'features',
      let: { feature_id: '$feature_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$feature_id']
            }
          }
        },
        {
          $project: {
            nameLang: 1,
            order: 1
          }
        }
      ],
      as: 'feature_id'
    })
    .unwind({ path: '$feature_id', preserveNullAndEmptyArrays: true })
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
    .group({
      _id: '$feature_id._id',
      nameLang: { $first: '$feature_id.nameLang' },
      order: { $first: '$feature_id.order' },
      data: {
        $push: { _id: '$_id', nameLang: '$nameLang', order: '$order' }
      }
    })
    .sort({ order: 1, 'data.order': 1 })
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
