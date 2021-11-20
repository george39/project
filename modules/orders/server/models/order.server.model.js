'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chalk = require('chalk');
const moment = require('moment');

/**
 * Order Schema
 */
const OrderSchema = new Schema({
  orderCode: {
    type: String,
    unique: 'orderCode already exists'
  },
  products: [
    {
      product_id: {
        type: Schema.ObjectId,
        ref: 'Product'
      },
      combination_id: {
        type: Schema.ObjectId,
        ref: 'Movement'
      },
      quantity: {
        type: Number
      },
      price: {
        type: Number
      },
      unitPrice: {
        type: Number
      }
    }
  ],
  paymentReceipt: {
    type: Schema.ObjectId,
    ref: 'ManagerFile',
    default: null
  },
  payType: {
    type: Schema.ObjectId,
    ref: 'DataType'
  },
  address: {
    address: {
      type: String
    },
    country: {
      type: String
    },
    city: {
      type: String
    },
    postalCode: {
      type: String
    },
    zone: {
      type: String
    }
  },
  shipper_id: {
    type: Schema.ObjectId,
    ref: 'Shipper'
  },
  trackingCode: {
    type: String
  },
  invoiceNumber: {
    type: Number,
    default: 0
  },
  message: {
    type: String
  },
  total: {
    type: String
  },
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop'
  },
  user_id: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  status: {
    type: Schema.ObjectId,
    ref: 'DataType'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  active: {
    type: Boolean,
    default: true
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
OrderSchema.methods.processFilter = function (params) {
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

  var date1;
  var date2;

  for (var field in OrderSchema.paths) {
    if (!OrderSchema.paths.hasOwnProperty(field)) continue;

    if (params[field] === '' || params[field] === null) {
      delete params[field];
      continue;
    }

    if (field === 'producto_id' && params.producto_id)
      params.producto_id = mongoose.Types.ObjectId(params.producto_id);

    if (field === 'payType' && params.payType)
      params.payType = mongoose.Types.ObjectId(params.payType);

    if (field === 'shipper_id' && params.shipper_id)
      params.shipper_id = mongoose.Types.ObjectId(params.shipper_id);

    if (field === 'shop' && params.shop) params.shop = mongoose.Types.ObjectId(params.shop);

    if (field === 'user_id' && params.user_id)
      params.user_id = mongoose.Types.ObjectId(params.user_id);

    if (field === 'user' && params['user._id']) {
      params.user = mongoose.Types.ObjectId(params['user._id']);
      delete params['user._id'];
    }

    if (field === 'status' && params.status) params.status = mongoose.Types.ObjectId(params.status);

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

    if (!params[field]) continue;

    if (OrderSchema.paths[field].instance === 'Number')
      params[field] = parseFloat(params[field], 10);
  }
  return params;
};

OrderSchema.methods.processPopulate = function (params) {
  if (Array.isArray(params)) {
    var array = [];

    params.forEach((item) => {
      array.push(typeof item === 'string' ? JSON.parse(item) : item);
    });

    return array;
  }

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
      if (typeof params[index] == 'string') params[index] = JSON.parse(params[index]);

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

OrderSchema.methods.processSort = function (params) {
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
        if (params2[keyParams2[0]] === 'desc' || params2[keyParams2[0]] === -1)
          objW[keyParams2[0]] = -1;
        else objW[keyParams2[0]] = 1;
      } else {
        if (params[i].indexOf('-') === 0) objW[params[i].replace('-', '')] = -1;
        else objW[params[i]] = 1;
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
    if (params[property] === 'desc' || params[property] === -1) params[property] = -1;
    else params[property] = 1;
  }

  return params;
};

OrderSchema.statics.seed = seed;

mongoose.model('Order', OrderSchema);

/**
 * Seeds the User collection with document (Order)
 * and provided options.
 */
function seed(doc, options) {
  const Order = mongoose.model('Order');

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
        if (skip) return resolve(true);

        User.findOne({
          roles: {
            $in: ['admin']
          }
        }).exec(function (err, admin) {
          if (err) return reject(err);

          doc.user = admin;

          return resolve();
        });
      });
    }

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Order.findOne({
          name: doc.name
        }).exec(function (err, existing) {
          if (err) return reject(err);

          if (!existing) return resolve(false);

          if (existing && !options.overwrite) return resolve(true);

          // Remove Order (overwrite)

          existing.remove(function (err) {
            if (err) return reject(err);

            return resolve(false);
          });
        });
      });
    }

    function add(skip) {
      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve({
            message: chalk.yellow('Database Seeding: Order\t' + doc.name + ' skipped')
          });
        }

        var order = new Order(doc);

        order.save(function (err) {
          if (err) return reject(err);

          return resolve({
            message: 'Database Seeding: Order\t' + order.name + ' added'
          });
        });
      });
    }
  });
}
