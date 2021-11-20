'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var DiscountList = mongoose.model('DiscountList');
var errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Discount List
 */
exports.create = function (req, res) {
  var discountList = new DiscountList(req.body);
  discountList.user = req.user;
  discountList.shop = req.user.shop;

  discountList.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(discountList);
    }
  });
};

/**
 * Show the current Discount List
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var discountList = req.discountList ? req.discountList.toJSON() : {};

  // Add a custom field to the DiscountList, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the DiscountList model.
  discountList.isCurrentUserOwner = !!(
    req.user &&
    discountList.user &&
    discountList.user._id.toString() === req.user._id.toString()
  );

  res.json(discountList);
};

/**
 * Update an Discount List
 */
exports.update = function (req, res) {
  var discountList = req.discountList;

  discountList.name = req.body.name;
  discountList.status = req.body.status;
  discountList.modifiedBy = req.user._id;
  discountList.modified = Date();

  discountList.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(discountList);
    }
  });
};

/**
 * Delete an Discount List
 */
exports.delete = function (req, res) {
  var discountList = req.discountList;

  discountList.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(discountList);
    }
  });
};

/**
 * List of Discount Lists
 */
exports.list = function (req, res) {
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new DiscountList().processFilter(filter);
  var processPopulate = new DiscountList().processPopulate(populate);
  var processSort = new DiscountList().processSort(sort);

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

  DiscountList.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, discountLists) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(discountLists);
      }
    });
};

/**
 * DiscountList middleware
 */
exports.discountListByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'DiscountList is invalid'
    });
  }

  DiscountList.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user', 'displayName')
    .exec(function (err, discountList) {
      if (err) {
        return next(err);
      } else if (!discountList) {
        return res.status(404).send({
          message: 'No discountList with that identifier has been found'
        });
      }
      req.discountList = discountList;
      next();
    });
};

/**
 * List of Discount
 */
exports.findAll = function (req, res) {
  var languageCode = req.query.lang;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new DiscountList().processFilter(filter);
  processFilter.status = true;
  var processPopulate = new DiscountList().processPopulate(populate);
  var processSort = new DiscountList().processSort(sort);

  var options = {
    filters: {
      field: req.query.field || '',
      mandatory: {
        contains: processFilter
      }
    },
    sort: processSort
  };

  DiscountList.find(processFilter)
    .sort(options.sort)
    .populate(processPopulate.path, processPopulate.select)
    .exec(function (err, priceLists) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(priceLists);
      }
    });
};
