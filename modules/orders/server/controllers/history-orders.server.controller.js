'use strict';

/**
 * Module dependencies
 */
const path = require('path');
const mongoose = require('mongoose');
const HistoryOrder = mongoose.model('HistoryOrders');
const Order = mongoose.model('Order');
const errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Order
 */
exports.create = async function (req, res) {
  const historyOrder = new HistoryOrder(req.body);

  const order = await Order.findOne({ _id: historyOrder.order_id }, { user_id: 1 });
  historyOrder.shop = req.user.shop;

  if (order) {
    historyOrder.user = order.user_id;
  }

  historyOrder.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      Order.update({ _id: historyOrder.order_id }, { $set: { status: historyOrder.status } }).exec(
        (error, data) => {
          if (error) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }

          return res.status(200).json(historyOrder);
        }
      );
    }
  });
};

exports.list = (req, res) => {
  const filter = req.query.filter || {};
  const processFilter = new HistoryOrder().processFilter(filter);

  HistoryOrder.find(processFilter)
    .sort({ created: 1 })
    .exec((err, orders) => {
      if (err) {
        return res.status(500).json({ message: err });
      }
      return res.status(200).json(orders);
    });
};

exports.listAggregate = (req, res) => {
  const filter = req.query.filter || {};
  const processFilter = new HistoryOrder().processFilter(filter);

  if (req.user.roles.indexOf('admin') === -1) {
    if (req.user.roles.includes('manager')) {
      processFilter.shop = req.user.shop;
    } else {
      processFilter.user = req.user._id;
    }
  }

  HistoryOrder.aggregate()
    .match(processFilter)
    .lookup({
      from: 'orders',
      localField: 'order_id',
      foreignField: '_id',
      as: 'order_id'
    })
    .unwind({
      path: '$order_id'
    })
    .lookup({
      from: 'datatypes',
      localField: 'order_id.status',
      foreignField: '_id',
      as: 'order_id.status'
    })
    .unwind({
      path: '$order_id.status',
      preserveNullAndEmptyArrays: true
    })
    .match({
      'order_id.status.nameLang': {
        $ne: 'entregado'
      }
    })
    .lookup({
      from: 'datatypes',
      localField: 'status',
      foreignField: '_id',
      as: 'status'
    })
    .unwind({
      path: '$status',
      preserveNullAndEmptyArrays: true
    })
    .lookup({
      from: 'datatypes',
      localField: 'order_id.payType',
      foreignField: '_id',
      as: 'order_id.payType'
    })
    .unwind({
      path: '$order_id.payType',
      preserveNullAndEmptyArrays: true
    })
    .lookup({
      from: 'shippers',
      localField: 'order_id.shipper_id',
      foreignField: '_id',
      as: 'order_id.shipper_id'
    })
    .unwind({
      path: '$order_id.shipper_id',
      preserveNullAndEmptyArrays: true
    })
    .group({
      _id: '$order_id._id',
      order_id: {
        $first: '$order_id'
      },
      address: {
        $first: '$order_id.address'
      },
      created: {
        $first: '$order_id.created'
      },
      total: {
        $first: '$order_id.total'
      },
      payType: {
        $first: '$order_id.payType'
      },
      shipper_id: {
        $first: '$order_id.shipper_id'
      },
      status: {
        $first: '$order_id.status'
      },
      history: {
        $push: '$$ROOT'
      }
    })
    .sort({ created: -1 })
    .exec((err, orders) => {
      if (err) {
        return res.status(500).json({ message: err });
      }
      return res.status(200).json(orders);
    });
};
