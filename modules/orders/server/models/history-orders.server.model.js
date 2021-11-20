'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const historyOrdersSchema = new Schema({
  order_id: {
    type: Schema.ObjectId,
    ref: 'Order'
  },
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop'
  },
  message: {
    type: String
  },
  status: {
    type: Schema.ObjectId,
    ref: 'DataType'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  }
});

// methods
historyOrdersSchema.methods.processFilter = function (params) {
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

  for (var field in historyOrdersSchema.paths) {
    if (!historyOrdersSchema.paths.hasOwnProperty(field)) {
      continue;
    }

    if (params[field] === '' || params[field] === null) {
      delete params[field];
      continue;
    }

    if (field === 'order_id' && params.order_id) {
      params.order_id = mongoose.Types.ObjectId(params.order_id);
    }

    if (field === 'status' && params.status) {
      params.status = mongoose.Types.ObjectId(params.status);
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

    if (!params[field]) {
      continue;
    }

    if (historyOrdersSchema.paths[field].instance === 'Number') {
      params[field] = parseFloat(params[field], 10);
    }
  }
  return params;
};

mongoose.model('HistoryOrders', historyOrdersSchema);
