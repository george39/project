'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var Third = mongoose.model('Third');
var errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Third
 */
exports.create = function (req, res) {
  var third = new Third(req.body);
  third.user = req.user._id;
  third.shop = req.user.shop;

  third.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(third);
    }
  });
};

/**
 * Show the current Third
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var third = req.third ? req.third.toJSON() : {};

  // Add a custom field to the Third, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Third model.
  third.isCurrentUserOwner = !!(
    req.user &&
    third.user &&
    third.user._id.toString() === req.user._id.toString()
  );

  res.json(third);
};

/**
 * Update an Third
 */
exports.update = function (req, res) {
  var third = req.third;

  third.name = req.body.name;
  third.typeThird_id = req.body.typeThird_id;
  third.typeDocument_id = req.body.typeDocument_id;
  third.numberDocument = req.body.numberDocument;
  third.phone = req.body.phone;
  third.email = req.body.email;
  third.address = req.body.address;
  third.status = req.body.status;
  third.modifiedBy = req.user._id;
  third.modified = Date();

  third.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(third);
    }
  });
};

/**
 * Delete an Third
 */
exports.delete = function (req, res) {
  var third = req.third;

  third.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(third);
    }
  });
};

/**
 * List of Thirds
 */
exports.list = function (req, res) {
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Third().processFilter(filter);
  var processPopulate = new Third().processPopulate(populate);
  var processSort = new Third().processSort(sort);

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

  Third.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, thirds) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(thirds);
      }
    });
};

/**
 * Third middleware
 */
exports.thirdByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Third is invalid'
    });
  }

  Third.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user typeThird_id typeDocument_id shop', 'displayName nameLang nameLang name')
    .exec(function (err, third) {
      if (err) {
        return next(err);
      } else if (!third) {
        return res.status(404).send({
          message: 'No third with that identifier has been found'
        });
      }
      req.third = third;
      next();
    });
};

exports.findAll = function (req, res) {
  // var field = req.query.field ? JSON.parse(req.query.field) : {};
  var sort = req.query.sort || '-modified';
  var filter = req.query.filter || {};

  var processFilter = new Third().processFilter(filter);
  var processSort = new Third().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.shop = req.user.shop;
  }

  Third.aggregate()
    .lookup({
      from: 'datatypes',
      localField: 'typeThird_id',
      foreignField: '_id',
      as: 'typeThird_id'
    })
    .unwind({ path: '$typeThird_id' })
    .lookup({
      from: 'datatypes',
      localField: 'typeDocument_id',
      foreignField: '_id',
      as: 'typeDocument_id'
    })
    .unwind({ path: '$typeDocument_id' })
    .match(processFilter)
    .sort(processSort)
    .exec(function (err, thirds) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(thirds);
      }
    });
};
