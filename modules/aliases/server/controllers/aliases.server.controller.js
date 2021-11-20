'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var Alias = mongoose.model('Alias');
var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an Alias
 */
exports.create = function (req, res) {
  var alias = new Alias(req.body);
  alias.user = req.user;

  alias.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(alias);
    }
  });
};

/**
 * Show the current Alias
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var alias = req.alias ? req.alias.toJSON() : {};

  // Add a custom field to the Alias, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Alias model.
  alias.isCurrentUserOwner = !!(req.user && alias.user && alias.user._id.toString() === req.user._id.toString());

  res.json(alias);
};

/**
 * Update an Alias
 */
exports.update = function (req, res) {
  var alias = req.alias;

  alias.nameLang = req.body.nameLang;
  alias.systemName = req.body.systemName;
  alias.status = req.body.status;
  alias.modifiedBy = req.user._id;
  alias.modified = Date();

  alias.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(alias);
    }
  });
};

/**
 * Delete an Alias
 */
exports.delete = function (req, res) {
  var alias = req.alias;

  alias.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(alias);
    }
  });
};

/**
 * List of Aliases
 */
exports.list = function (req, res) {
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Alias().processFilter(filter);
  var processPopulate = new Alias().processPopulate(populate);
  var processSort = new Alias().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.user = req.user._id;
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

  Alias.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, aliases) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(aliases);
      }
    });
};

/**
 * Alias middleware
 */
exports.aliasByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Alias is invalid'
    });
  }

  Alias.findById(id)
    .populate({ path: 'modifiedBy', select: ['displayName'] })
    .populate({ path: 'user', select: ['displayName'] })
    .exec(function (err, alias) {
      if (err) {
        return next(err);
      } else if (!alias) {
        return res.status(404).send({
          message: 'No alias with that identifier has been found'
        });
      }
      req.alias = alias;
      next();
    });
};

/**
 * Alias findAll
 */
exports.findAll = function (req, res) {
  var sort = req.query.sort || { modified: -1 };
  var filter = req.query.filter || {};

  var processFilter = new Alias().processFilter(filter);
  var processSort = new Alias().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.user = req.user._id;
  }

  Alias.aggregate()
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
