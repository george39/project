'use strict';

/**
 * Module dependencies
 */
const { resolve } = require('path');
const mongoose = require('mongoose');
const Order = mongoose.model('Order');
const ManagerConfiguration = mongoose.model('ManagerConfiguration');
const HistoryOrder = mongoose.model('HistoryOrders');
const errorHandler = require(resolve('./modules/core/server/controllers/errors.server.controller'));
const { generateRandomString } = require(resolve('./helpers/global-helpers'));
const Shipper = mongoose.model('Shipper');
const DataType = mongoose.model('DataType');
const Notification = mongoose.model('Notification');
const Shop = mongoose.model('Shop');

/**
 * Create an Order
 */
exports.create = async function (req, res) {
  const order = new Order(req.body);
  order.user = req.user._id;
  order.user_id = req.user._id;
  order.shop = req.user.shop;
  order.orderCode = generateRandomString(8);
  order.trackingCode = order.address.postalCode || '';
  order.active = true;

  if (!req.body.shipper_id) {
    const aggregate = [
      {
        $lookup: {
          from: 'thirds',
          localField: 'third_id',
          foreignField: '_id',
          as: 'third'
        }
      },
      {
        $unwind: {
          path: '$third',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          $or: [
            {
              'third.name': {
                $regex: 'envia',
                $options: 'i'
              }
            },
            {
              'third.name': {
                $regex: 'envía',
                $options: 'i'
              }
            }
          ]
        }
      }
    ];

    try {
      const shipper = await Shipper.aggregate(aggregate);
      if (shipper[0] !== null) order.shipper_id = shipper[0] ? shipper[0]._id : null;
      else order.shipper_id = null;
    } catch (err) {
      console.error(err);
      order.shipper_id = null;
    }
  }

  const invoiceNumber = await Order.find({})
    .select('invoiceNumber')
    .sort({ invoiceNumber: -1 })
    .limit(1);

  if (invoiceNumber[0]) order.invoiceNumber = invoiceNumber[0].invoiceNumber + 1;

  const orderFound = await Order.findOne({ orderCode: order.orderCode });

  // SI EL CÓDIGO GENERADO YA EXISTE, SE GENERA UN NUEVO CÓDIGO
  while (orderFound !== null) {
    order.orderCode = generateRandomString(8);
    orderFound = await Order.findOne({ orderCode: order.orderCode });
  }

  var error;

  try {
    await order.save();
  } catch (_err_) {
    order.invoiceNumber++;
    await order.save().catch((err) => (error = errorHandler.getErrorMessage(err)));
  }

  if (error) {
    console.error(error);
    return res.status(422).send({
      message: error
    });
  }

  const newHistoryOrder = {
    order_id: order._id,
    message: '',
    status: order.status,
    user: req.user._id,
    shop: req.user.shop
  };

  try {
    await new HistoryOrder(newHistoryOrder).save();
    const shop = await Shop.findOne({ _id: req.user.shop }, 'user_id').lean().exec();

    const notification = new Notification({
      user: shop.user_id,
      createdBy: req.user._id,
      name: 'Nuevo pedido',
      description: `EL usuario <strong>${req.user.displayName}</strong> ha creado un nuevo pedido`,
      redirectTo: {
        state: 'orders.edit',
        params: { orderId: order._id.toString() }
      },
      icon: 'fas fa-dollar-sign',
      read: false
    });

    await notification.save();

    return res.status(200).json(order);
  } catch (err) {
    console.error(err);
    return res.status(422).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Show the current Order
 */
exports.read = async function (req, res) {
  // convert mongoose document to JSON
  var order = req.order ? req.order.toJSON() : {};
  const clientLang = req.query.filter ? req.query.filter.lang : 'es';
  var listDiscountId;

  const globalDiscount = await ManagerConfiguration.findOne(
    { friendly: 'global_discount' },
    { value: 1 }
  );

  // eslint-disable-next-line radix
  const valueGlobalDisc = globalDiscount ? parseInt(globalDiscount.value) : 0;

  for (var i = 0; i < order.products.length; i++) {
    // VALIDAR SI EL PRODUCTO TIENE EL IDIOMA REQUERIDO, SI NO LO TIENE
    // SE LE ASIGNA UNO POR DEFECTO
    var productLang = order.products[i].product_id.productLang;
    if (!Array.isArray(productLang)) {
      productLang = [productLang];
    }

    const language = productLang.filter((lang) => lang.lang_id.languageCode === clientLang);

    if (req.user && req.user.listDiscounts) {
      listDiscountId = req.user.listDiscounts;
    }

    if (order.products[i].product_id.typeDiscount) {
      switch (order.products[i].product_id.typeDiscount.nameLang) {
        case 'global':
          var valueDiscount = Math.trunc(
            order.products[i].product_id.priceTaxIncluded -
              (order.products[i].product_id.priceTaxIncluded * valueGlobalDisc) / 100
          );
          order.products[i].product_id.discountPrice = Math.ceil(valueDiscount / 50) * 50;
          order.products[i].product_id.discountValue = valueGlobalDisc;
          break;
        case 'individual':
          order.products[i].product_id.discountPrice = order.products[i].product_id.localDiscount
            ? order.products[i].product_id.localDiscount.newPrice
            : order.products[i].product_id.priceTaxIncluded;
          order.products[i].product_id.discountValue = Math.round(
            ((order.products[i].product_id.priceTaxIncluded -
              order.products[i].product_id.discountPrice) *
              100) /
              order.products[i].product_id.priceTaxIncluded
          );
          break;
        case 'listPrice':
          // eslint-disable-next-line no-loop-func
          var listPrice = order.products[i].product_id.discountList_id.filter((itemList) =>
            itemList._id.equals(listDiscountId)
          );
          // eslint-disable-next-line eqeqeq
          if (
            listPrice[0] &&
            // eslint-disable-next-line eqeqeq
            listPrice[0].newPrice != order.products[i].product_id.priceTaxIncluded
          ) {
            order.products[i].product_id.discountPrice = listPrice[0].newPrice;
            order.products[i].product_id.discountValue = Math.round(
              ((order.products[i].product_id.priceTaxIncluded -
                order.products[i].product_id.discountPrice) *
                100) /
                order.products[i].product_id.priceTaxIncluded
            );
          }
          break;
      }
    }

    order.products[i].product_id.productLang = language[0]
      ? language[0]
      : order.products[i].product_id.productLang[0];
  }

  return res.json(order);
};

/**
 * Update an Order
 */
exports.update = async function (req, res) {
  var order = req.order;

  order.paymentReceipt = req.body.paymentReceipt;

  if (req.body.paymentReceipt) {
    try {
      const status = await DataType.findOne({ nameLang: 'comprobante subido' });
      // eslint-disable-next-line no-throw-literal
      if (status === null) throw 'El estado de compra "comprobante subido" no existe';
      order.status = status._id;
    } catch (err) {
      console.error(err);
    }
  }

  order.modifiedBy = req.user._id;
  order.modified = Date();

  order.save(order, function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(order);
    }
  });
};

/**
 * Delete an Order
 */
exports.delete = function (req, res) {
  var order = new Order(req.order);

  HistoryOrder.deleteMany({ order_id: order._id }).exec((error, data) => {
    if (error) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(error)
      });
    }
    order.active = false;
    order.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        return res.json(order);
      }
    });
  });
};

/**
 * List of Orders
 */
exports.list = function (req, res) {
  const count = req.query.count || 100;
  const page = req.query.page || 1;
  const sort = req.query.sorting || { modified: 'desc' };
  const populate = req.query.populate || [];
  const filter = req.query.filter || {};

  const processFilter = new Order().processFilter(filter);
  const processPopulate = new Order().processPopulate(populate);
  const processSort = new Order().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    if (req.user.roles.includes('manager')) {
      processFilter.shop = req.user.shop;
    } else {
      processFilter.user_id = req.user._id;
    }
  }

  processFilter.active = true;

  const options = {
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

  Order.find()
    .populate(processPopulate)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, orders) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        return res.status(200).json(orders);
      }
    });
};

/**
 * Order middleware
 */
exports.orderByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Order is invalid'
    });
  }

  Order.findById(id)
    .populate([
      'status',
      'paymentReceipt',
      'payType',
      {
        path: 'shipper_id',
        populate: {
          path: 'third_id',
          select: 'name'
        }
      },
      {
        path: 'user_id',
        select: 'displayName phone DNI'
      }
    ])
    .populate({
      path: 'products.product_id',
      select: 'code managerFile_id lang_id typeDiscount productLang',
      populate: [
        {
          path: 'managerFile_id',
          select: 'path'
        },
        {
          path: 'productLang.lang_id',
          select: 'languageCode'
        },
        {
          path: 'typeDiscount',
          select: 'nameLang'
        }
      ]
    })
    .populate('products.combination_id')
    .exec(async function (err, order) {
      if (err) {
        return next(err);
      } else if (!order) {
        return res.status(404).send({
          message: 'No order with that identifier has been found'
        });
      }

      req.order = order;
      next();
    });
};

/**
 * Order findAll
 */
exports.findAll = function (req, res) {
  const sort = req.query.sort || { modified: -1 };
  const filter = req.query.filter || {};
  const processFilter = new Order().processFilter(filter);
  const processSort = new Order().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.user = req.user._id;
  }

  processFilter.active = true;

  Order.aggregate()
    .lookup({
      from: 'productos',
      let: { producto_id: '$producto_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$producto_id']
            }
          }
        },
        {
          $project: {
            name: 1
          }
        }
      ],
      as: 'producto_id'
    })
    .unwind({ path: '$producto_id', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'shippers',
      let: { shipper_id: '$shipper_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$shipper_id']
            }
          }
        },
        {
          $project: {
            name: 1
          }
        }
      ],
      as: 'shipper_id'
    })
    .unwind({ path: '$shipper_id', preserveNullAndEmptyArrays: true })
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
            name: 1
          }
        }
      ],
      as: 'user_id'
    })
    .unwind({ path: '$user_id', preserveNullAndEmptyArrays: true })
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
        return res.status(200).json(results);
      }
    });
};
