'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var Tax = mongoose.model('Tax');
var errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Tax
 */
exports.create = function (req, res) {
  var tax = new Tax(req.body);
  tax.user = req.user._id;
  tax.shop = req.user.shop;

  tax.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(tax);
    }
  });
};

/**
 * Show the current Tax
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var tax = req.tax ? req.tax.toJSON() : {};

  // Add a custom field to the Tax, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Tax model.
  tax.isCurrentUserOwner = !!(
    req.user &&
    tax.user &&
    tax.user._id.toString() === req.user._id.toString()
  );

  res.json(tax);
};

/**
 * Update an Tax
 */
exports.update = function (req, res) {
  var tax = req.tax;

  tax.nameLang = req.body.nameLang;
  tax.value = req.body.value;
  tax.status = req.body.status;
  tax.modifiedBy = req.user._id;
  tax.modified = Date();

  tax.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(tax);
    }
  });
};

/**
 * Delete an Tax
 */
exports.delete = function (req, res) {
  var tax = req.tax;

  tax.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(tax);
    }
  });
};

/**
 * List of Taxes
 */
exports.list = function (req, res) {
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Tax().processFilter(filter);
  processFilter.status = true;
  var processPopulate = new Tax().processPopulate(populate);
  var processSort = new Tax().processSort(sort);

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

  Tax.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, taxes) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(taxes);
      }
    });
};

/**
 * Tax middleware
 */
exports.taxByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Tax is invalid'
    });
  }

  Tax.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user', 'displayName')
    .exec(function (err, tax) {
      if (err) {
        return next(err);
      } else if (!tax) {
        return res.status(404).send({
          message: 'No tax with that identifier has been found'
        });
      }
      req.tax = tax;
      next();
    });
};

exports.findAll = function (req, res) {
  // var field = req.query.field ? JSON.parse(req.query.field) : {};
  var sort = req.query.sort || '-modified';
  var filter = req.query.filter || {};

  var processFilter = new Tax().processFilter(filter);
  processFilter.status = true;
  var processSort = new Tax().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.shop = req.user.shop;
  }

  Tax.aggregate()
    .match(processFilter)
    .sort(processSort)
    .exec(function (err, taxes) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(taxes);
      }
    });
};
