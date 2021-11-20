'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var path = require('path');
var config = require(path.resolve('./config/config'));
var chalk = require('chalk');

/**
 * Shipper Schema
 */
var ShipperSchema = new Schema({
  third_id: {
    type: Schema.ObjectId,
    ref: 'Third'
  },
  url: {
    type: String
  },
  shippingSpeed: {
    type: String
  },
  shippingCost: {
    type: String
  },
  maxWidth: {
    type: String
  },
  maxHeight: {
    type: String
  },
  maxDepth: {
    type: String
  },
  maxWeight: {
    type: String
  },
  rate: {
    type: String
  },
  isFree: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: false
  },
  managerFile_id: [
    {
      type: Schema.ObjectId,
      ref: 'ManagerFile'
    }
  ],
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
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

// methods
ShipperSchema.methods.processFilter = function (params) {
  if (!params || typeof params == 'undefined') {
    return {};
  }

  if (typeof params == 'string') {
    params = JSON.parse(params);
  }

  if (typeof params != 'object') {
    return {};
  }

  if (Object.keys(params).length === 0) {
    return {};
  }

  var moment = require('moment');
  var date1;
  var date2;

  for (var field in ShipperSchema.paths) {
    if (ShipperSchema.paths.hasOwnProperty(field)) {
      continue;
    }

    if (params[field] === '' || params[field] === null) {
      delete params[field];
      continue;
    }

    if (field === 'third_id' && params.third_id) {
      params.third_id = mongoose.Types.ObjectId(params.third_id);
    }

    if (field === 'managerFile_id' && params.managerFile_id) {
      params.managerFile_id = mongoose.Types.ObjectId(params.managerFile_id);
    }

    if (field === 'shop' && params.shop) {
      params.shop = mongoose.Types.ObjectId(params.shop);
    }

    if (field === 'user' && params['user._id']) {
      params.user = mongoose.Types.ObjectId(params['user._id']);
      delete params['user._id'];
    }

    if (field === 'created' && params.created) {
      date1 = moment(params[field].begin, 'YYYY-MM-DD H:mm:ss');
      date2 = moment(params[field].end, 'YYYY-MM-DD H:mm:ss');
      params[field] = {
        $gte: date1.toDate(),
        $lte: date2.toDate()
      };
    }

    if (field === 'modifiedby' && params['modifiedby._id']) {
      params.modifiedby = mongoose.Types.ObjectId(params['modifiedby._id']);
      delete params['modifiedby._id'];
    }

    if (field === 'modified' && params.modified) {
      date1 = moment(params[field].begin, 'YYYY-MM-DD H:mm:ss');
      date2 = moment(params[field].end, 'YYYY-MM-DD H:mm:ss');
      params[field] = {
        $gte: date1.toDate(),
        $lte: date2.toDate()
      };
    }

    if (!params[field]) {
      continue;
    }

    if (ShipperSchema.paths[field].instance === 'Number') {
      params[field] = parseFloat(params[field], 10);
    }
  }
  return params;
};

ShipperSchema.methods.processPopulate = function (params) {
  if (!params || typeof params == 'undefined') {
    return {
      path: '',
      select: ''
    };
  }

  var typeParams = 'array';

  if (typeof params === 'string') {
    params = JSON.parse(params);
    typeParams = 'object';
  }

  if (typeof params != 'object') {
    return {
      path: '',
      select: ''
    };
  }

  if (typeParams === 'array') {
    var lengthParams = params.length;
    var objectPopulate = {
      path: '',
      select: ''
    };

    for (var index = 0; index < params.length; index++) {
      if (typeof params[index] == 'string') {
        params[index] = JSON.parse(params[index]);
      }
      objectPopulate.path += params[index].path;
      objectPopulate.select += params[index].select;
      if (index < lengthParams - 1) {
        objectPopulate.path += ' ';
        objectPopulate.select += ' ';
      }
    }

    return objectPopulate;
  }

  if (Object.keys(params).length === 0) {
    return {
      path: '',
      select: ''
    };
  }

  return params;
};

ShipperSchema.methods.processSort = function (params) {
  if (!params || typeof params == 'undefined') {
    return {
      modified: -1
    };
  }

  if (typeof params == 'string') {
    params = JSON.parse(params);
  }

  if (typeof params != 'object') {
    return {
      modified: -1
    };
  }

  if (Object.keys(params).length === 0) {
    return {
      modified: -1
    };
  }

  for (const property in params) {
    if (params[property] === 'desc') {
      params[property] = -1;
    } else {
      params[property] = 1;
    }
  }

  return params;
};

ShipperSchema.statics.seed = seed;

mongoose.model('Shipper', ShipperSchema);

/**
 * Seeds the User collection with document (Shipper)
 * and provided options.
 */
function seed(doc, options) {
  var Shipper = mongoose.model('Shipper');

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
        Shipper.findOne({
          title: doc.title
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

          // Remove Shipper (overwrite)

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
            message: chalk.yellow('Database Seeding: Shipper\t' + doc.title + ' skipped')
          });
        }

        var shipper = new Shipper(doc);

        shipper.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Shipper\t' + shipper.title + ' added'
          });
        });
      });
    }
  });
}
