'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var Shop = mongoose.model('Shop');
var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an Shop
 */
exports.create = function (req, res) {
  var shop = new Shop(req.body);
  shop.user = req.user;
  shop.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(shop);
    }
  });
};

/**
 * Show the current Shop
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var shop = req.shop ? req.shop.toJSON() : {};

  // Add a custom field to the Shop, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Shop model.
  shop.isCurrentUserOwner = !!(req.user && shop.user && shop.user._id.toString() === req.user._id.toString());

  res.json(shop);
};

/**
 * Update an Shop
 */
exports.update = function (req, res) {
  var shop = req.shop;

  shop.name = req.body.name;
  shop.user_id = req.body.user_id;
  shop.managerFile_id = req.body.managerFile_id;
  shop.description = req.body.description;
  shop.url = req.body.url;
  shop.template = req.body.template;
  shop.status = req.body.status;
  shop.modifiedBy = req.user._id;
  shop.modified = Date();

  shop.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(shop);
    }
  });
};

/**
 * Delete an Shop
 */
exports.delete = function (req, res) {
  var shop = req.shop;

  shop.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(shop);
    }
  });
};

/**
 * List of Shops
 */
exports.list = function (req, res) {
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Shop().processFilter(filter);
  var processPopulate = new Shop().processPopulate(populate);
  var processSort = new Shop().processSort(sort);

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

  Shop.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, shops) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(shops);
      }
    });
};

/**
 * Shop middleware
 */
exports.shopByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shop is invalid'
    });
  }

  Shop.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user user_id', 'displayName name')
    .populate({ path: 'managerFile_id', select: ['originalname', 'path'] })
    .exec(function (err, shop) {
      if (err) {
        return next(err);
      } else if (!shop) {
        return res.status(404).send({
          message: 'No shop with that identifier has been found'
        });
      }
      req.shop = shop;
      next();
    });
};

/**
 * Shop findAll
 */
exports.findAll = function (req, res) {
  var sort = req.query.sort || { modified: -1 };
  var filter = req.query.filter || {};

  var processFilter = new Shop().processFilter(filter);
  var processSort = new Shop().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.user = req.user._id;
  }

  Shop.aggregate()
    .unwind({ path: '$managerFile_id' })
    .lookup({
      from: 'managerfiles',
      let: { managerFile_id: '$managerFile_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$managerFile_id']
            }
          }
        },
        {
          $project: {
            originalname: 1,
            path: 1
          }
        }
      ],
      as: 'managerFile_id'
    })
    .unwind({ path: '$managerFile_id' })
    .lookup({
      from: 'users',
      let: { user_id: '$user_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$user_id']
            }
          }
        },
        {
          $project: {
            displayName: 1
          }
        }
      ],
      as: 'user_id'
    })
    .unwind({ path: '$user_id' })
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
