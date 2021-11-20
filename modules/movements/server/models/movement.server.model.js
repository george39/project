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
 * Movement Schema
 */
var MovementSchema = new Schema({
  product_id: {
    type: Schema.ObjectId,
    ref: 'Product'
  },
  managerFile_id: [
    {
      type: Schema.ObjectId,
      ref: 'ManagerFile'
    }
  ],
  isDefault: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number
  },
  featureDetail_id: [
    {
      _id: {
        type: Schema.ObjectId,
        ref: 'FeatureDetail'
      },
      nameLang: String,
      parentId: {
        type: Schema.ObjectId,
        ref: 'Feature'
      },
      order: Number,
      parentNameLang: String
    }
  ],
  typeMovement_id: {
    type: Schema.ObjectId,
    ref: 'DataType'
  },
  quantity: {
    type: Number
  },
  balance: {
    type: Number
  },
  order_id: {
    type: Schema.ObjectId,
    ref: 'Order'
  },
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop'
  },
  status: {
    type: Boolean,
    default: false
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
MovementSchema.methods.processFilter = function (params) {
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

  for (var field in MovementSchema.paths) {
    if (!MovementSchema.paths.hasOwnProperty(field)) {
      continue;
    }

    if (params[field] === '' || params[field] === null) {
      delete params[field];
      continue;
    }

    if (field === 'featureDetail_id' && params['featureDetail_id._id']) {
      var helper = [];

      // eslint-disable-next-line no-loop-func
      params['featureDetail_id._id'].forEach((item) => {
        helper.push(mongoose.Types.ObjectId(item));
      });

      params['featureDetail_id._id'] = {
        $all: helper
      };
    }

    if (field === 'product_id' && params['product_id._id']) {
      params['product_id._id'] = mongoose.Types.ObjectId(params['product_id._id']);
    }

    if (field === 'featureDetail_id' && params.featureDetail_id) {
      params.featureDetail_id = mongoose.Types.ObjectId(params.featureDetail_id);
    }

    if (field === 'typeMovement_id' && params.typeMovement_id) {
      params.typeMovement_id = mongoose.Types.ObjectId(params.typeMovement_id);
    }

    if (field === 'order_id' && params.order_id) {
      params.order_id = mongoose.Types.ObjectId(params.order_id);
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

    if (MovementSchema.paths[field].instance === 'Number') {
      params[field] = parseFloat(params[field], 10);
    }
  }
  return params;
};

MovementSchema.methods.processPopulate = function (params) {
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

MovementSchema.methods.processSort = function (params) {
  if (!params || typeof params == 'undefined') {
    return {
      modified: -1
    };
  }

  if (Array.isArray(params)) {
    var objW = {};
    for (const i in params) {
      if (typeof params[i] == 'string' && params[i].indexOf('{') === 0 && params[i].indexOf('}')) {
        var params2 = JSON.parse(params[i]);
        var keyParams2 = Object.keys(params2);
        if (params2[keyParams2[0]] === 'desc' || params2[keyParams2[0]] === -1) {
          objW[keyParams2[0]] = -1;
        } else {
          objW[keyParams2[0]] = 1;
        }
      } else {
        if (params[i].indexOf('-') === 0) {
          objW[params[i].replace('-', '')] = -1;
        } else {
          objW[params[i]] = 1;
        }
      }
    }
    return objW;
  }

  if (typeof params == 'string' && params.indexOf('{') === 0 && params.indexOf('}')) {
    params = JSON.parse(params);
  } else if (typeof params == 'string' && params.indexOf('-') === 0) {
    params = {
      [params.replace('-', '')]: -1
    };
  } else {
    params = {
      [params]: 1
    };
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
    if (params[property] === 'desc' || params[property] === -1) {
      params[property] = -1;
    } else {
      params[property] = 1;
    }
  }

  return params;
};

MovementSchema.methods.processDetails = function (data, details) {
  var newMovement = {
    status: data.status,
    _id: data._id,
    product_id: data.product_id,
    featureDetail_id: data.featureDetail_id,
    typeMovement_id: data.typeMovement_id,
    quantity: data.quantity,
    balance: data.balance,
    created: data.created,
    modified: data.modified,
    user: data.user,
    details: [],
    __v: 0
  };

  details.forEach(function (element) {
    var obj = {
      status: element.status,
      _id: element._id,
      product_id: element.product_id,
      featureDetail_id: element.featureDetail_id,
      typeMovement_id: element.typeMovement_id,
      quantity: element.quantity,
      balance: element.balance,
      created: element.created,
      modified: element.modified,
      user: element.user
    };
    newMovement.details.push(obj);
  });

  return newMovement;
};

MovementSchema.statics.seed = seed;

mongoose.model('Movement', MovementSchema);

/**
 * Seeds the User collection with document (Movement)
 * and provided options.
 */
function seed(doc, options) {
  var Movement = mongoose.model('Movement');

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
        Movement.findOne({
          name: doc.name
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

          // Remove Movement (overwrite)

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
            message: chalk.yellow('Database Seeding: Movement\t' + doc.name + ' skipped')
          });
        }

        var movement = new Movement(doc);

        movement.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Movement\t' + movement.name + ' added'
          });
        });
      });
    }
  });
}
