'use strict';

/**
 * Module dependencies
 */
const { resolve } = require('path');
const { Types, model } = require('mongoose');
const { find } = require('lodash');
const DataType = model('DataType');
const DiscountMassive = model('DiscountMassive');
const Product = model('Product');
const { getErrorMessage } = require(resolve(
  './modules/core/server/controllers/errors.server.controller'
));
const { applyMassiveLocalDiscount } = require(resolve('./helpers/product-helpers'));
const { asyncForEach } = require(resolve('./helpers/global-helpers'));
const { findAllProductsInCommon, removeDiscount } = require(resolve(
  './helpers/massive-discount-helpers'
));

async function findProducts(filter = {}) {
  const products = await DiscountMassive.find(filter)
    .lean()
    .populate({
      path: 'products',
      populate: {
        path: 'productLang.lang_id',
        select: 'languageCode'
      },
      select: 'productLang'
    })
    .select(['products', 'name'])
    .exec();

  return products;
}

/**
 * Create an Discount Massive
 */
exports.create = async function (req, res) {
  const discountMassive = new DiscountMassive(req.body);

  try {
    if (discountMassive.products.length === 0) {
      throw Error('Debes agregar algún producto');
    }

    discountMassive.user = req.user;

    if (!req.user.roles.includes('admin')) {
      discountMassive.shop = req.user.shop;
    }

    const massiveDiscounts = await findProducts({
      products: { $in: discountMassive.products },
      shop: req.user.shop
    });

    let commonProducts = false;

    if (massiveDiscounts && massiveDiscounts.length > 0) {
      commonProducts = findAllProductsInCommon(discountMassive.products, massiveDiscounts);
    }

    if (commonProducts) {
      const productsToApplyDiscount = discountMassive.products.filter((product) => {
        return !commonProducts.productsIds.includes(product.toString());
      });

      discountMassive.products = productsToApplyDiscount;
    }

    await applyMassiveLocalDiscount(discountMassive.products, discountMassive);
    await discountMassive.save();

    if (commonProducts) {
      return res.status(200).json({ _id: discountMassive._id, ...commonProducts });
    }

    return res.status(200).json(discountMassive);
  } catch (e) {
    return res.status(422).send({
      message: getErrorMessage(e)
    });
  }
};

/**
 * Show the current Discount Massive
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  const discountMassive = req.discountMassive ? req.discountMassive.toJSON() : {};

  // Add a custom field to the DiscountMassive, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the DiscountMassive model.
  discountMassive.isCurrentUserOwner = !!(
    req.user &&
    discountMassive.user &&
    discountMassive.user._id.toString() === req.user._id.toString()
  );

  return res.status(200).json(discountMassive);
};

exports.overrideProducts = async (req, res) => {
  const discountMassive = await DiscountMassive.findOne({
    _id: Types.ObjectId(req.params.discountId)
  });

  const { products } = req.body;

  await asyncForEach(req.body.productsInCommon, async (item) => {
    const discount = await DiscountMassive.findOne({
      _id: item.massiveDiscountId
    });

    const localProducts = item.products.map((product) => product._id);

    const newProducts = discount.products.filter((id) => {
      return !localProducts.includes(id.toString());
    });

    discount.products = newProducts;
    await discount.save();
  });

  await applyMassiveLocalDiscount(products, discountMassive);
  discountMassive.products.push(...products);
  await discountMassive.save();

  return res.status(200).json({});
};

/**
 * Update an Discount Massive
 */
exports.update = async function (req, res) {
  const discountMassive = req.discountMassive;

  try {
    const oldProducts = discountMassive.products.map((product) => product.toString());
    const oldDiscountValue = discountMassive.discountValue;
    const newProducts = req.body.products;

    const removedProducts = oldProducts.filter((product) => {
      return !newProducts.includes(product);
    });

    const discountsWithProductsInCommon = await findProducts({
      products: { $in: newProducts },
      shop: req.user.shop,
      _id: { $ne: discountMassive._id }
    });

    let commonProducts = false;

    if (discountsWithProductsInCommon && discountsWithProductsInCommon.length > 0) {
      commonProducts = findAllProductsInCommon(newProducts, discountsWithProductsInCommon);
    }

    if (commonProducts) {
      const productsToApplyDiscount = newProducts.filter((product) => {
        return !commonProducts.productsIds.includes(product);
      });

      discountMassive.products = productsToApplyDiscount;
    } else {
      discountMassive.products = newProducts;
    }

    const addedProducts = discountMassive.products.filter((product) => {
      return !oldProducts.includes(product);
    });

    discountMassive.discountValue = req.body.discountValue;
    discountMassive.name = req.body.name;
    discountMassive.categories = req.body.categories;
    discountMassive.typeValueDiscount = req.body.typeValueDiscount;
    discountMassive.modifiedBy = req.user._id;
    discountMassive.modified = Date();

    if (req.user.roles.includes('admin')) {
      discountMassive.shop = req.body.shop;
    }

    if (oldDiscountValue !== req.body.discountValue) {
      // Si el valor de descuento ha cambiado, se aplica el cambio a todos los productos
      await applyMassiveLocalDiscount(discountMassive.products, discountMassive);
    } else {
      // Si el valor de descuento no ha cambiado, se aplica el descuento solo a los productos recíen añadidos.
      await applyMassiveLocalDiscount(addedProducts, discountMassive);
    }

    await removeDiscount(removedProducts);
    await discountMassive.save();

    if (commonProducts) {
      return res.status(200).json({ _id: discountMassive._id, ...commonProducts });
    }

    return res.status(200).json(discountMassive);
  } catch (e) {
    console.error(e);
    return res.status(422).send({
      message: getErrorMessage(e)
    });
  }
};

/**
 * Delete an Discount Massive
 */
exports.delete = async function (req, res) {
  const discountMassive = req.discountMassive;

  await removeDiscount(discountMassive.products);

  discountMassive.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: getErrorMessage(err)
      });
    } else {
      return res.status(200).json(discountMassive);
    }
  });
};

/**
 * List of Discount Massives
 */
exports.list = function (req, res) {
  const count = req.query.count || 100;
  const page = req.query.page || 1;
  const sort = req.query.sorting || { modified: 'desc' };
  const populate = req.query.populate || [];
  const filter = req.query.filter || {};

  const processFilter = new DiscountMassive().processFilter(filter);
  const processPopulate = new DiscountMassive().processPopulate(populate);
  const processSort = new DiscountMassive().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.shop = req.user.shop;
  }

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

  DiscountMassive.find()
    .lean()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, discountMassives) {
      if (err) {
        return res.status(422).send({
          message: getErrorMessage(err)
        });
      } else {
        return res.status(200).json(discountMassives);
      }
    });
};

/**
 * DiscountMassive middleware
 */
exports.discountMassiveByID = function (req, res, next, id) {
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'DiscountMassive is invalid'
    });
  }

  DiscountMassive.findById(id)
    .populate({ path: 'modifiedBy', select: ['displayName'] })
    .populate({ path: 'user', select: ['displayName'] })
    .populate({ path: 'product', select: ['name'] })
    .exec(function (err, discountMassive) {
      if (err) {
        return next(err);
      } else if (!discountMassive) {
        return res.status(404).send({
          message: 'No discountMassive with that identifier has been found'
        });
      }
      req.discountMassive = discountMassive;
      next();
    });
};

/**
 * DiscountMassive findAll
 */
exports.findAll = function (req, res) {
  const sort = req.query.sort || { modified: -1 };
  const filter = req.query.filter || {};

  const processFilter = new DiscountMassive().processFilter(filter);
  const processSort = new DiscountMassive().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.shop = req.user.shop;
  }

  DiscountMassive.aggregate()
    .lookup({
      from: 'products',
      let: { product: '$product' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$product']
            }
          }
        },
        {
          $project: {
            name: 1
          }
        }
      ],
      as: 'product'
    })
    .unwind({ path: '$product', preserveNullAndEmptyArrays: true })
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
          message: getErrorMessage(err)
        });
      } else {
        return res.status(200).json(results);
      }
    });
};
