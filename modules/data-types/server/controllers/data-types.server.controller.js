'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var DataType = mongoose.model('DataType');
var Third = mongoose.model('Third');
var errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Data Type
 */
exports.create = function (req, res) {
  req.body.shop = req.user.shop;
  var dataType = new DataType(req.body);
  dataType.user = req.user;

  dataType.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(dataType);
    }
  });
};

/**
 * Show the current Data Type
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var dataType = req.dataType ? req.dataType.toJSON() : {};

  // Add a custom field to the DataType, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the DataType model.
  dataType.isCurrentUserOwner = !!(
    req.user &&
    dataType.user &&
    dataType.user._id.toString() === req.user._id.toString()
  );

  res.json(dataType);
};

/**
 * Update an Data Type
 */
exports.update = function (req, res) {
  var dataType = req.dataType;

  dataType.nameLang = req.body.nameLang;
  dataType.alias_id = req.body.alias_id;
  dataType.system = req.body.system;
  dataType.order = req.body.order;
  dataType.status = req.body.status;
  dataType.shop = req.body.shop;
  dataType.modifiedBy = req.user._id;
  dataType.modified = Date();

  dataType.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(dataType);
    }
  });
};

/**
 * Delete an Data Type
 */
exports.delete = function (req, res) {
  var dataType = req.dataType;

  dataType.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(dataType);
    }
  });
};

/**
 * List of Data Types
 */
exports.list = function (req, res) {
  var count = parseInt(req.query.count, 10) || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new DataType().processFilter(filter);
  var processPopulate = new DataType().processPopulate(populate);
  var processSort = new DataType().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.user = req.user._id;
    processFilter.shop = req.user.shop;
  }

  var options = {
    start: (page - 1) * count,
    count: count
  };

  DataType.aggregate()
    .lookup({
      from: 'aliases',
      let: { alias_id: '$alias_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$alias_id']
            }
          }
        },
        {
          $project: {
            nameLang: 1
          }
        }
      ],
      as: 'alias_id'
    })
    .unwind({ path: '$alias_id', preserveNullAndEmptyArrays: true })
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
    .sort(processSort)
    .facet({
      options: [{ $count: 'total' }, { $addFields: options }],
      results: [{ $skip: options.start }, { $limit: options.count }]
    })
    .exec(function (err, result) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      var dataTypes;

      if (result[0].results.length > 0) {
        dataTypes = {
          total: result[0].options[0].total,
          options: {
            start: result[0].options[0].start,
            count: result[0].options[0].count
          },
          results: result[0].results
        };
        return res.json(dataTypes);
      }

      dataTypes = {
        results: [],
        total: 0
      };

      return res.json(dataTypes);
    });
};

/**
 * List of Data Types
 */
// exports.list = function (req, res) {
//   var count = req.query.count || 100;
//   var page = req.query.page || 1;
//   var sort = req.query.sorting || { modified: 'desc' };
//   var populate = req.query.populate || [];
//   var filter = req.query.filter || {};

//   var processFilter = new DataType().processFilter(filter);
//   var processPopulate = new DataType().processPopulate(populate);
//   var processSort = new DataType().processSort(sort);

//   if (req.user.roles.indexOf('admin') === -1) {
//     processFilter.user = req.user._id;
//     processFilter.shop = req.user.shop;
//   }

//   var options = {
//     filters: {
//       field: req.query.field || '',
//       mandatory: {
//         contains: processFilter
//       }
//     },
//     sort: processSort,
//     start: (page - 1) * count,
//     count: count
//   };

//   DataType.find()
//     .populate(processPopulate.path, processPopulate.select)
//     .field(options)
//     .keyword(options)
//     .filter(options)
//     .order(options)
//     .page(options, function (err, dataTypes) {
//       if (err) {
//         return res.status(422).send({
//           message: errorHandler.getErrorMessage(err)
//         });
//       } else {
//         console.log('dataTypes');
//         console.log(dataTypes);
//         console.log('dataTypes');
//         res.json(dataTypes);
//       }
//     });
// };

/**
 * DataType middleware
 */
exports.dataTypeByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'DataType is invalid'
    });
  }

  DataType.findById(id)
    .populate({ path: 'modifiedBy', select: ['displayName'] })
    .populate({ path: 'user', select: ['displayName'] })
    .populate({ path: 'alias_id', select: ['nameLang'] })
    .populate({ path: 'shop', select: ['name'] })
    .exec(function (err, dataType) {
      if (err) {
        return next(err);
      } else if (!dataType) {
        return res.status(404).send({
          message: 'No dataType with that identifier has been found'
        });
      }
      req.dataType = dataType;
      next();
    });
};

/**
 * DataType findAll
 */
exports.findAll = function (req, res) {
  var sort = req.query.sort || { modified: -1 };
  var filter = req.query.filter || {};

  var processFilter = new DataType().processFilter(filter);
  var processSort = new DataType().processSort(sort);

  // if (req.user.roles.indexOf('admin') === -1) {
  //   processFilter.user = req.user._id;
  // }

  DataType.aggregate()
    .lookup({
      from: 'aliases',
      let: { alias_id: '$alias_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$alias_id']
            }
          }
        },
        {
          $project: {
            nameLang: 1,
            systemName: 1
          }
        }
      ],
      as: 'alias_id'
    })
    .unwind({ path: '$alias_id', preserveNullAndEmptyArrays: true })
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
    .exec(function (err, dataTypes) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(dataTypes);
      }
    });
};

exports.getShippers = (req, res) => {
  Third.aggregate([
    {
      $lookup: {
        from: 'datatypes',
        localField: 'typeThird_id',
        foreignField: '_id',
        as: 'typeThird_id'
      }
    },
    { $unwind: { path: '$typeThird_id' } },
    { $match: { status: true, 'typeThird_id.nameLang': 'Transportista' } }
  ]).exec((err, shippers) => {
    if (err) {
      return res.status(500).json({ message: err });
    }

    return res.status(200).json(shippers);
  });
};
