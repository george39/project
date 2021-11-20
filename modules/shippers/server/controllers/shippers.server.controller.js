'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var Shipper = mongoose.model('Shipper');
var errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Shipper
 */
exports.create = function (req, res) {
  var shipper = new Shipper(req.body);
  shipper.user = req.user._id;
  shipper.shop = req.user.shop;

  shipper.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(shipper);
    }
  });
};

/**
 * Show the current Shipper
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var shipper = req.shipper ? req.shipper.toJSON() : {};

  // Add a custom field to the Shipper, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Shipper model.
  shipper.isCurrentUserOwner = !!(
    req.user &&
    shipper.user &&
    shipper.user._id.toString() === req.user._id.toString()
  );

  res.json(shipper);
};

/**
 * Update an Shipper
 */
exports.update = function (req, res) {
  var shipper = req.shipper;

  shipper.third_id = req.body.third_id;
  shipper.url = req.body.url;
  shipper.shippingSpeed = req.body.shippingSpeed;
  shipper.shippingCost = req.body.shippingCost;
  shipper.maxWidth = req.body.maxWidth;
  shipper.maxHeight = req.body.maxHeight;
  shipper.maxDepth = req.body.maxDepth;
  shipper.maxWeight = req.body.maxWeight;
  shipper.rate = req.body.rate;
  shipper.isFree = req.body.isFree;
  shipper.status = req.body.status;
  shipper.managerFile_id = req.body.managerFile_id;
  shipper.modifiedBy = req.user._id;
  shipper.modified = Date();

  shipper.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(shipper);
    }
  });
};

/**
 * Delete an Shipper
 */
exports.delete = function (req, res) {
  var shipper = req.shipper;

  shipper.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(shipper);
    }
  });
};

/**
 * List of Shippers
 */
exports.list = function (req, res) {
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Shipper().processFilter(filter);
  var processPopulate = new Shipper().processPopulate(populate);
  var processSort = new Shipper().processSort(sort);

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
    sort: processSort,
    start: (page - 1) * count,
    count: count
  };

  Shipper.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, shippers) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(shippers);
      }
    });
};

/**
 * Shipper middleware
 */
exports.shipperByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shipper is invalid'
    });
  }

  Shipper.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user third_id shop', 'displayName name name')
    .populate({ path: 'managerFile_id', select: ['originalname', 'path'] })
    .exec(function (err, shipper) {
      if (err) {
        return next(err);
      } else if (!shipper) {
        return res.status(404).send({
          message: 'No shipper with that identifier has been found'
        });
      }
      req.shipper = shipper;
      next();
    });
};

exports.findAll = function (req, res) {
  // var field = req.query.field ? JSON.parse(req.query.field) : {};
  var sort = req.query.sort || { modified: 'desc' };
  var filter = req.query.filter || {};

  var processFilter = new Shipper().processFilter(filter);
  var processSort = new Shipper().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.shop = req.user.shop;
  }

  Shipper.aggregate()
    .lookup({
      from: 'thirds',
      localField: 'third_id',
      foreignField: '_id',
      as: 'third_id'
    })
    .unwind({ path: '$third_id' })
    .lookup({
      from: 'managerfiles',
      localField: 'managerFile_id',
      foreignField: '_id',
      as: 'managerFile_id'
    })
    .match(processFilter)
    .sort(processSort)
    .exec(function (err, shippers) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(shippers);
      }
    });
};
