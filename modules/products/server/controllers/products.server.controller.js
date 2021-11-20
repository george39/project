'use strict';

/**
 * Module dependencies
 */
const md5 = require('md5');
const { resolve } = require('path');
const mongoose = require('mongoose');
const Order = mongoose.model('Order');
const Product = mongoose.model('Product');
const Category = mongoose.model('Category');
const Movement = mongoose.model('Movement');
const DataType = mongoose.model('DataType');
const HistoryOrder = mongoose.model('HistoryOrders');
const config = require(resolve('./config/config.js'));
const { getErrorMessage } = require(resolve(
  './modules/core/server/controllers/errors.server.controller'
));
const ManagerConfiguration = mongoose.model('ManagerConfiguration');
const { processFilter } = require(resolve('./helpers/model-helpers'));
const { asyncForEach } = require(resolve('./helpers/global-helpers'));
const { processLang, applyDiscount } = require(resolve('./helpers/product-helpers'));

/**
 * Create an Product
 */
exports.create = async (req, res) => {
  const product = new Product(req.body);
  product.user = req.user._id;
  product.shop = req.user.shop;

  try {
    await product.save();
    return res.status(200).json(product);
  } catch (e) {
    return res.status(422).send({
      message: getErrorMessage(e)
    });
  }
};

/**
 * Show the current Product
 */
exports.read = async function (req, res) {
  // convert mongoose document to JSON
  let product = req.product ? req.product.toJSON() : {};

  // Add a custom field to the Product, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Product model.
  product.isCurrentUserOwner = !!(
    req.user &&
    product.user &&
    product.user._id.toString() === req.user._id.toString()
  );

  var listDiscountId;

  const globalDiscount = await ManagerConfiguration.findOne(
    { friendly: 'global_discount' },
    { value: 1 }
  );
  // eslint-disable-next-line radix
  const valueGlobalDisc = globalDiscount ? parseInt(globalDiscount.value) : 0;

  if (req.user && req.user.listDiscounts) {
    listDiscountId = req.user.listDiscounts;
  }

  if (product.typeDiscount) {
    product = applyDiscount(product, listDiscountId, valueGlobalDisc);
  }

  return res.status(200).json(product);
};

/**
 * Update a Product
 */
exports.update = async function (req, res) {
  if (req.body.movements && req.body.movements.length >= 1) {
    const dataTypeInput = await mongoose
      .model('DataType')
      .aggregate()
      .lookup({ from: 'aliases', localField: 'alias_id', foreignField: '_id', as: 'alias_id' })
      .match({ nameLang: 'input', 'alias_id.systemName': 'typeMovement' })
      .then();

    await asyncForEach(req.body.movements, async function (value) {
      if (value.data._id === undefined) {
        const obj = {
          product_id: req.body._id,
          featureDetail_id: value.sons,
          typeMovement_id: dataTypeInput[0]._id,
          quantity: value.data.quantity,
          balance: value.data.quantity,
          price: value.data.price,
          managerFile_id: value.data.managerFile_id,
          shop: req.user.shop,
          isDefault: value.data.isDefault,
          status: true
        };

        const movement = new Movement(obj);
        await movement.save();

        if (movement.isDefault) {
          await Movement.updateOne(
            {
              status: true,
              product_id: movement.product_id,
              isDefault: true,
              _id: { $ne: movement._id }
            },
            { $set: { isDefault: false } }
          );
        }
      }
    });
  }

  const product = req.product;

  product.set(req.body);
  product.modifiedBy = req.user._id;
  product.modified = Date();

  try {
    await product.save();
    return res.status(200).json(product);
  } catch (e) {
    return res.status(422).send({
      message: getErrorMessage(e)
    });
  }
};

/**
 * Delete an Product
 */
exports.delete = async (req, res) => {
  const product = req.product;

  try {
    await product.remove();
    return res.status(200).json(product);
  } catch (e) {
    return res.status(422).send({
      message: getErrorMessage(e)
    });
  }
};

exports.purchase = async (req, res) => {
  const localSign = md5(config.payBinlab.secretKey + JSON.stringify(req.body.Affiliate));
  if (localSign !== req.body.single) {
    console.error('Incorrect Sign');
    console.error(`Local Sign: ${localSign}, Response sign: ${req.body.single}`);
    console.error('Incorrect Sign');
    return res.status(400).json({ message: 'Incorrect Sign' });
  }

  const order = await Order.findOne({ _id: mongoose.Types.ObjectId(req.body.custom) }).lean();

  if (order === null || !order) {
    console.error('Orden no encontrada');
    return res.status(400).json({ message: 'Orden no encontrada' });
  }

  if (parseInt(order.total, 10) !== parseInt(req.body.Transaction.amount, 10)) {
    console.error('Valor de orden es incorrecto');
    console.error(`DB value: ${order.total}, Response value: ${req.body.Transaction.amount}`);
    console.error('Valor de orden es incorrecto');
    return res.status(401).json({ message: 'Valor de orden es incorrecto' });
  }

  const messageShort = req.body.Transaction.messageshort;
  const status =
    messageShort === 'Aprobada' || messageShort === 'a' ? 'pago aceptado' : 'error en pago';

  console.log(messageShort);
  console.log(status);

  const dataType = await DataType.findOne({
    nameLang: status
  });

  if (status === 'pago aceptado') {
    await updateMovements(order.products);
  }

  Order.update(
    { _id: mongoose.Types.ObjectId(req.body.custom) },
    { $set: { status: mongoose.Types.ObjectId(dataType._id) } }
  ).exec(async (err, success) => {
    if (err) {
      return res.status(422).send({
        message: getErrorMessage(err)
      });
    }

    const newHistory = new HistoryOrder({
      message: dataType.nameLang,
      order_id: order._id,
      shop: order.shop,
      status: dataType._id,
      user: order.user_id
    });

    await newHistory.save();
    return res.status(200).json(newHistory);
  });
};

async function updateMovements(array) {
  const DataType = mongoose.model('DataType');
  const dataTypeInput = await DataType.aggregate()
    .lookup({ from: 'aliases', localField: 'alias_id', foreignField: '_id', as: 'alias_id' })
    .match({ nameLang: 'output', 'alias_id.systemName': 'typeMovement' })
    .then();

  await asyncForEach(array, async function (value) {
    const oldMovement = await Movement.findOne({ _id: value.combination_id }).lean().exec();

    if (oldMovement) {
      const balance = oldMovement.balance - value.quantity;

      const newMovement = new Movement({
        product_id: oldMovement.product_id,
        featureDetail_id: oldMovement.featureDetail_id,
        typeMovement_id: dataTypeInput[0]._id,
        quantity: value.quantity,
        balance: balance,
        price: oldMovement.price,
        managerFile_id: oldMovement.managerFile_id,
        shop: oldMovement.shop,
        isDefault: oldMovement.isDefault,
        status: balance > 0
      });

      await Movement.update({ _id: oldMovement._id }, { $set: { status: false } }, async function (
        err,
        success
      ) {
        if (!err) {
          await newMovement.save();
        }
      });
    }
  });
}

/**
 * List of Products
 */
exports.list = async function (req, res) {
  const count = parseInt(req.query.count, 10) || 100;
  const page = parseInt(req.query.page, 10) || 1;
  const sort = req.query.sorting || { created: 'desc' };
  const populate = req.query.populate || [];
  const filter = req.query.filter || {};
  const lang = req.query.lang || 'es';

  const processFilter = new Product().processFilter(filter);
  const processPopulate = new Product().processPopulate(populate);
  const processSort = new Product().processSort(sort);

  try {
    const query = Product.find(processFilter);
    const total = await query.countDocuments();
    const response = await query
      .lean()
      .sort(processSort)
      .limit(count)
      .skip((page - 1) * count)
      .populate(processPopulate.path, processPopulate.select)
      .populate('productLang.lang_id')
      .select(req.query.field || '')
      .exec('find');

    const obj = {
      results: response,
      page,
      count,
      total
    };

    // Process client Lang
    for (let i = 0; i < obj.results.length; i++) {
      obj.results[i].productLang = [processLang(obj.results[i].productLang, lang)];
    }

    return res.status(200).json(obj);
  } catch (e) {
    console.error(e);
    return res.status(422).send({
      message: getErrorMessage(e)
    });
  }
};

exports.listAggregate = (req, res) => {
  const count = req.query.count || 18;
  const page = req.query.page || 1;
  const sort = req.query.sort || { 'product._id': 1 };
  const filter = req.query.filter || {};
  const clientLang = req.query.lang || 'es';

  const processFilter = new Product().processFilter(filter);
  const processSort = new Product().processSort(sort);

  Product.aggregate([
    {
      $match: {
        status: true,
        priceTaxIncluded: {
          $ne: null
        },
        availableNow: true
      }
    },
    {
      $lookup: {
        from: 'managerfiles',
        localField: 'managerFile_id',
        foreignField: '_id',
        as: 'managerFile_id'
      }
    },
    {
      $unwind: {
        path: '$productLang'
      }
    },
    {
      $lookup: {
        from: 'thirds',
        localField: 'maker_id',
        foreignField: '_id',
        as: 'maker_id'
      }
    },
    {
      $unwind: {
        path: '$maker_id'
      }
    },
    {
      $lookup: {
        from: 'langs',
        localField: 'productLang.lang_id',
        foreignField: '_id',
        as: 'productLang.lang_id'
      }
    },
    {
      $unwind: {
        path: '$productLang.lang_id'
      }
    },
    {
      $group: {
        _id: '$_id',
        productLang: {
          $push: '$productLang'
        },
        product: {
          $first: '$$ROOT'
        }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.category_id',
        foreignField: '_id',
        as: 'product.category_id'
      }
    },
    {
      $lookup: {
        from: 'datatypes',
        localField: 'product.typeDiscount',
        foreignField: '_id',
        as: 'product.typeDiscount'
      }
    },
    {
      $unwind: {
        path: '$product.typeDiscount',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'datatypes',
        localField: 'product.localDiscount.typeDiscount',
        foreignField: '_id',
        as: 'product.localDiscount.typeDiscount'
      }
    },
    {
      $unwind: {
        path: '$product.localDiscount.typeDiscount',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: processFilter
    },
    {
      $sort: processSort
    },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        // eslint-disable-next-line radix
        results: [{ $skip: parseInt((page - 1) * count) }, { $limit: parseInt(count) }]
      }
    }
  ]).exec(async (err, products) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: getErrorMessage(err) });
    }

    const total = products[0].metadata[0] ? products[0].metadata[0].total : 0;
    var toSend = {
      total,
      pages: Math.ceil(total / count),
      page: page,
      results: []
    };

    const globalDiscount = await ManagerConfiguration.findOne(
      { friendly: 'global_discount' },
      { value: 1 }
    );
    // eslint-disable-next-line radix
    const valueGlobalDisc = globalDiscount ? parseInt(globalDiscount.value) : 0;

    var listDiscountId;

    if (req.user && req.user.listDiscounts) {
      listDiscountId = req.user.listDiscounts;
    }

    products[0].results.forEach((item) => {
      var obj = item.product;
      obj.productLang = processLang(item.productLang, clientLang);

      if (obj.typeDiscount) {
        obj = applyDiscount(obj, listDiscountId, valueGlobalDisc);
      }

      toSend.results.push(obj);
    });

    return res.status(200).json(toSend);
  });
};

exports.getSectionsByCategory = async (req, res) => {
  const lang = req.query.lang || 'es';
  const sort = req.query.sort || { 'product._id': 1 };

  const globalDiscount = await ManagerConfiguration.findOne(
    { friendly: 'global_discount' },
    { value: 1 }
  );
  // eslint-disable-next-line radix
  const valueGlobalDisc = globalDiscount ? parseInt(globalDiscount.value) : 0;

  var listDiscountId;
  if (req.user && req.user.listDiscounts) {
    listDiscountId = req.user.listDiscounts;
  }

  const aggregateCategories = [
    {
      $match: { status: true, showSection: true }
    },
    {
      $unwind: {
        path: '$categoryLang'
      }
    },
    {
      $lookup: {
        from: 'langs',
        localField: 'categoryLang.lang_id',
        foreignField: '_id',
        as: 'categoryLang.lang_id'
      }
    },
    {
      $unwind: {
        path: '$categoryLang.lang_id',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$_id',
        categoryLang: {
          $push: '$categoryLang'
        },
        created: {
          $first: '$created'
        },
        parent: {
          $first: '$parent'
        }
      }
    },
    {
      $sort: { created: -1 }
    }
  ];

  const aggregate = [
    {
      $match: {
        show_in_sections_by_category: true
      }
    },
    {
      $lookup: {
        from: 'managerfiles',
        localField: 'managerFile_id',
        foreignField: '_id',
        as: 'managerFile_id'
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category_id'
      }
    },
    {
      $unwind: {
        path: '$category_id',
        preserveNullAndEmptyArrays: true
      }
    },
    {},
    {
      $unwind: {
        path: '$productLang'
      }
    },
    {
      $lookup: {
        from: 'langs',
        localField: 'productLang.lang_id',
        foreignField: '_id',
        as: 'productLang.lang_id'
      }
    },
    {
      $unwind: {
        path: '$productLang.lang_id'
      }
    },
    {
      $group: {
        _id: '$_id',
        productLang: {
          $push: '$productLang'
        },
        product: {
          $first: '$$ROOT'
        }
      }
    },
    {
      $lookup: {
        from: 'datatypes',
        localField: 'product.typeDiscount',
        foreignField: '_id',
        as: 'product.typeDiscount'
      }
    },
    {
      $unwind: {
        path: '$product.typeDiscount',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'datatypes',
        localField: 'product.localDiscount.typeDiscount',
        foreignField: '_id',
        as: 'product.localDiscount.typeDiscount'
      }
    },
    {
      $unwind: {
        path: '$product.localDiscount.typeDiscount',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        'product.productLang': '$productLang'
      }
    },
    {
      $sort: sort
    }
  ];

  try {
    const categories = await Category.aggregate(aggregateCategories);
    var rst = [];
    await asyncForEach(categories, async function (_category) {
      aggregate[4] = {
        $match: {
          $or: [
            { 'category_id._id': _category._id },
            { 'category_id.ancestors._id': _category._id }
          ]
        }
      };

      var array = [];

      const sections = await Product.aggregate(aggregate);

      if (!sections) return res.status(200).json([]);

      for (var i = 0; i < sections.length; i++) {
        _category.categoryLang = processLang(_category.categoryLang);
        delete sections[i].product.category_id.ancestors;

        sections[i].product.category_id.categoryLang = processLang(
          sections[i].product.category_id.categoryLang,
          lang
        );

        sections[i].product.productLang = processLang(sections[i].product.productLang, lang);
        if (sections[i].product.typeDiscount) {
          sections[i].product = applyDiscount(sections[i].product, listDiscountId, valueGlobalDisc);
        }

        array.push(sections[i].product);
      }

      rst.push({
        category_id: _category,
        products: array
      });
    });
    return res.status(200).json(rst);
  } catch (e) {
    return res.status(422).json({ message: getErrorMessage(e) });
  }
};

/**
 * Product middleware
 */
exports.productByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Product is invalid'
    });
  }

  Product.findById(mongoose.Types.ObjectId(id))
    .populate('modifiedBy', 'displayName')
    .populate('productLang.lang_id', 'languageCode')
    .populate({ path: 'user', select: ['displayName'] })
    .populate({ path: 'managerFile_id', select: ['originalname', 'path'] })
    .populate({ path: 'category_id', select: ['categoryLang'] })
    .populate({ path: 'typeDiscount', select: ['nameLang'] })
    .populate({ path: 'localDiscount.typeDiscount', select: ['nameLang'] })
    .populate({ path: 'tax_id', select: ['nameLang'] })
    .populate({ path: 'maker_id', select: ['name'] })
    .populate({ path: 'provider_id', select: ['name'] })
    .populate({ path: 'shop', select: ['name'] })
    .populate({
      path: 'shippingData.shipper_id',
      model: 'Shipper',
      populate: {
        path: 'third_id',
        model: 'Third'
      }
    })
    .populate({ path: 'shop', select: ['name'] })
    .exec(async function (err, product) {
      if (err) {
        return next(err);
      } else if (!product) {
        return res.status(404).send({
          message: 'No product with that identifier has been found'
        });
      }

      req.product = product;
      next();
    });
};

/**
 * List of Categories
 */
exports.findAll = function (req, res) {
  const sort = req.query.sorting || { created: 'desc' };
  const field = req.query.field || '';
  const populate = req.query.populate || [];
  const filter = processFilter(req.query.filter);
  const page = req.query.page || 0;
  const limit = parseInt(req.query.limit, 10) || 100;

  const processPopulate = new Product().processPopulate(populate);
  const processSort = new Product().processSort(sort);

  Product.find(filter)
    .lean()
    .select(field)
    .sort(processSort)
    .limit(limit)
    .skip(page * limit)
    .populate(processPopulate.path, processPopulate.select)
    .exec(function (err, products) {
      if (err) {
        console.error(err);
        return res.status(422).send({
          message: getErrorMessage(err)
        });
      } else {
        return res.status(200).json(products);
      }
    });
};

/**
 * List of products to apply massive discount
 */
exports.massiveDiscountsProducts = async function (req, res) {
  const sort = req.query.sorting || { created: 'desc' };
  const categories = JSON.parse(req.query.categories || []);
  const categoriesIds = categories.map((category) => mongoose.Types.ObjectId(category));
  const processSort = new Product().processSort(sort);

  const filter = {
    priceTaxIncluded: {
      $ne: null
    },
    $or: [
      {
        'category_id._id': {
          $in: categoriesIds
        }
      },
      {
        'category_id.ancestors._id': {
          $in: categoriesIds
        }
      }
    ]
  };

  const aggregate = [
    {
      $lookup: {
        from: 'categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category_id'
      }
    },
    {
      $match: filter
    },
    {
      $project: {
        category_id: 1,
        productLang: 1
      }
    },
    {
      $sort: processSort
    }
  ];

  try {
    const response = await Product.aggregate(aggregate).exec();
    const products = {};

    for (let i = 0; i < response.length; i++) {
      const categoryId = response[i].category_id[0]._id;
      if (products[categoryId]) {
        products[categoryId].push(response[i]);
      } else {
        products[categoryId] = [response[i]];
      }
    }

    return res.status(200).json(products);
  } catch (e) {
    console.error(e);
    return res.status(422).json(getErrorMessage(e));
  }
};

