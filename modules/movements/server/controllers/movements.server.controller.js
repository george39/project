'use strict';

/**
 * Module dependencies
 */
const { resolve } = require('path');
const mongoose = require('mongoose');
const Movement = mongoose.model('Movement');
const DataType = mongoose.model('DataType');
const Product = mongoose.model('Product');
const ManagerConfiguration = mongoose.model('ManagerConfiguration');
const errorHandler = require(resolve('./modules/core/server/controllers/errors.server.controller'));
const { processLang } = require(resolve('./helpers/product-helpers'));

function applyMovement(typeMovement, balance, quantity) {
  if (typeMovement === 'input') return balance + quantity;

  balance -= quantity;
  return balance < 0 ? 0 : balance;
}

/**
 * Create an Movement
 */
exports.create = async function (req, res) {
  const picture = req.query.picture || '0';

  if (picture === '1') {
    if (req.body.data._id) {
      await Movement.update(
        { _id: req.body.data._id },
        {
          $set: {
            managerFile_id: req.body.data.managerFile_id
          }
        }
      );

      return res.status(200).json({ message: 'Imagenes actualizadas' });
    } else {
      const input = await DataType.findOne({ nameLang: 'input' }).lean().exec();

      const _movement = new Movement({
        product_id: req.body.product_id,
        featureDetail_id: req.body.sons,
        typeMovement_id: input ? input._id : null,
        quantity: req.body.data.quantity,
        balance: req.body.data.quantity,
        price: req.body.data.price,
        isDefault: req.body.data.isDefault,
        status: true,
        managerFile_id: req.body.data.managerFile_id
      });

      _movement.user = req.user._id;
      _movement.shop = req.user.shop;

      try {
        await _movement.save();
        if (_movement.isDefault) {
          await Movement.updateOne(
            {
              status: true,
              product_id: _movement.product_id,
              isDefault: true,
              _id: { $ne: _movement._id }
            },
            { $set: { isDefault: false } }
          ).then();
        }
        return res.status(200).json({ message: 'OK' });
      } catch (error) {
        return res.status(422).json({ message: error });
      }
    }
  }

  const typeMovement = await DataType.findById(req.body.typeMovement_id._id).lean().exec();

  if (!req.body.featureDetail_id) {
    const product = await Product.findOne({ _id: req.body.product_id }).exec();
    product.quantity = applyMovement(typeMovement.nameLang, product.quantity, req.body.quantity);
    await product.save();
    return res.status(200).json({ message: 'Movimiento guardado' });
  }

  const oldMovement = await Movement.findById(req.body.featureDetail_id._id).lean().exec();
  const balance = applyMovement(typeMovement.nameLang, oldMovement.balance, req.body.quantity);

  const movement = new Movement({
    product_id: oldMovement.product_id,
    featureDetail_id: oldMovement.featureDetail_id,
    typeMovement_id: req.body.typeMovement_id._id,
    quantity: req.body.quantity,
    balance: balance <= 0 ? 0 : balance,
    price: req.body.price,
    isDefault: req.body.isDefault,
    status: balance > 0
  });

  movement.user = req.user._id;
  movement.shop = req.user.shop;

  const rstSave = await movement.save(async function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (movement.isDefault) {
        await Movement.updateOne(
          {
            status: true,
            product_id: movement.product_id,
            isDefault: true,
            _id: { $ne: movement._id }
          },
          { $set: { isDefault: false } }
        ).then();
      }

      return movement;
    }
  });

  const rstUpdateMovement = await Movement.updateOne({ _id: oldMovement._id }, { status: false });

  if (rstUpdateMovement.ok === 1) {
    return res.status(200).json(rstSave);
  }
};

/**
 * Show the current Movement
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  const movement = req.movement ? req.movement.toJSON() : {};

  // Add a custom field to the Movement, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Movement model.
  movement.isCurrentUserOwner = !!(
    req.user &&
    movement.user &&
    movement.user._id.toString() === req.user._id.toString()
  );

  return res.status(200).json(movement);
};

/**
 * Update an Movement
 */
exports.update = function (req, res) {
  var movement = req.movement;

  movement.product_id = req.body.product_id;
  movement.featureDetail_id = req.body.featureDetail_id;
  movement.typeMovement_id = req.body.typeMovement_id;
  movement.quantity = req.body.quantity;
  movement.balance = req.body.balance;
  movement.order_id = req.body.order_id;
  movement.status = req.body.status;
  movement.modifiedBy = req.user._id;
  movement.price = req.body.price;
  movement.modified = Date();

  return res.status(422).send({
    message: 'No movement with that identifier has been found'
  });
};

/**
 * Delete an Movement
 */
exports.delete = function (req, res) {
  const movement = req.movement;
  return res.json(movement);
};

/**
 * List of Movements
 */
exports.list = function (req, res) {
  const lang = req.query.lang || 'es';
  const count = req.query.count || 100;
  const page = req.query.page || 1;
  const sort = req.query.sorting || { modified: 'desc' };
  const populate = req.query.populate || [];
  const filter = req.query.filter || {};

  const processFilter = new Movement().processFilter(filter);
  const processPopulate = new Movement().processPopulate(populate);
  const processSort = new Movement().processSort(sort);
  processFilter.status = true;

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

  Movement.find()
    .populate(processPopulate.path, processPopulate.select)
    .populate({
      path: 'product_id',
      populate: {
        path: 'productLang.lang_id',
        select: 'languageCode'
      }
    })
    .populate('typeMovement_id', 'nameLang')
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, movements) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        const response = [];
        for (let i = 0; i < movements.results.length; i++) {
          if (movements.results[i].product_id) {
            const productLang = processLang(movements.results[i].product_id.productLang, lang);
            movements.results[i].product_id.productLang = [productLang];
            response.push(movements.results[i]);
          }
        }

        movements.results = response;
        return res.status(200).json(movements);
      }
    });
};

/**
 * Movement middleware
 */
exports.movementByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Movement is invalid'
    });
  }

  Movement.findById(id)
    .populate({ path: 'modifiedBy', select: ['displayName'] })
    .populate({ path: 'user', select: ['displayName'] })
    .populate({ path: 'product_id', select: ['productLang'] })
    .populate({ path: 'featureDetail_id', select: ['nameLang'] })
    .populate({ path: 'typeMovement_id', select: ['nameLang'] })
    .populate({ path: 'order_id', select: ['name'] })
    .populate({ path: 'shop', select: ['name'] })
    .exec(function (err, movement) {
      if (err) {
        return next(err);
      } else if (!movement) {
        return res.status(404).send({
          message: 'No movement with that identifier has been found'
        });
      }
      req.movement = movement;
      next();
    });
};

/**
 * Movement findAll
 */
exports.findAll = function (req, res) {
  var sort = req.query.sort || { modified: -1 };
  var filter = req.query.filter || {};

  var processFilter = new Movement().processFilter(filter);
  var processSort = new Movement().processSort(sort);

  // if (req.user) {
  //   if (req.user.roles.indexOf('admin') === -1) {
  //     processFilter.user = req.user._id;
  //   }
  // }

  Movement.aggregate()
    .lookup({
      from: 'products',
      localField: 'product_id',
      foreignField: '_id',
      as: 'product_id'
    })
    .unwind({ path: '$product_id', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'datatypes',
      localField: 'product_id.typeDiscount',
      foreignField: '_id',
      as: 'product_id.typeDiscount'
    })
    .unwind({ path: '$product_id.typeDiscount', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'datatypes',
      let: { typeMovement_id: '$typeMovement_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$typeMovement_id']
            }
          }
        },
        {
          $project: {
            name: 1
          }
        }
      ],
      as: 'typeMovement_id'
    })
    .unwind({ path: '$typeMovement_id', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'orders',
      let: { order_id: '$order_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$order_id']
            }
          }
        },
        {
          $project: {
            name: 1
          }
        }
      ],
      as: 'order_id'
    })
    .unwind({ path: '$order_id', preserveNullAndEmptyArrays: true })
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
    .unwind({ path: '$featureDetail_id', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'features',
      localField: 'featureDetail_id.parentId',
      foreignField: '_id',
      as: 'featureDetail_id.parentId'
    })
    .unwind({ path: '$featureDetail_id.parentId', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'datatypes',
      localField: 'featureDetail_id.parentId.typeFeature_id',
      foreignField: '_id',
      as: 'featureDetail_id.parentId.typeFeature_id'
    })
    .unwind({ path: '$featureDetail_id.parentId.typeFeature_id', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'managerfiles',
      localField: 'managerFile_id',
      foreignField: '_id',
      as: 'managerFile_id'
    })
    .group({
      _id: '$_id',
      balance: {
        $first: '$balance'
      },
      cost: {
        $first: '$cost'
      },
      created: {
        $first: '$created'
      },
      featureDetail_id: {
        $push: '$featureDetail_id'
      },
      modified: {
        $first: '$modified'
      },
      price: {
        $first: '$price'
      },
      managerFile_id: {
        $first: '$managerFile_id'
      },
      isDefault: {
        $first: '$isDefault'
      },
      product_id: {
        $first: '$product_id'
      },
      quantity: {
        $first: '$quantity'
      },
      status: {
        $first: '$status'
      },
      typeMovement_id: {
        $first: '$typeMovement_id'
      }
    })
    .match(processFilter)
    .sort(processSort)
    .exec(async function (err, results) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        const globalDiscount = await ManagerConfiguration.findOne(
          { friendly: 'global_discount' },
          { value: 1 }
        );
        var listDiscountId;

        if (req.user && req.user.listDiscounts) {
          listDiscountId = req.user.listDiscounts;
        }
        // eslint-disable-next-line radix
        const valueGlobalDisc = globalDiscount ? parseInt(globalDiscount.value) : 0;

        var array = [];

        results.forEach((item) => {
          array.push(applyDiscount(item, valueGlobalDisc, listDiscountId));
        });

        return res.json(array);
      }
    });
};

/**
 * FIND MOVEMENT
 */
exports.findMovement = function (req, res) {
  var sort = req.query.sort || { modified: -1 };
  var filter = req.query.filter || {};

  var processFilter = new Movement().processFilter(filter);
  var processSort = new Movement().processSort(sort);

  // if (req.user) {
  //   if (req.user.roles.indexOf('admin') === -1) {
  //     processFilter.user = req.user._id;
  //   }
  // }

  Movement.aggregate()
    .lookup({
      from: 'products',
      localField: 'product_id',
      foreignField: '_id',
      as: 'product_id'
    })
    .unwind({ path: '$product_id', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'datatypes',
      localField: 'product_id.typeDiscount',
      foreignField: '_id',
      as: 'product_id.typeDiscount'
    })
    .unwind({ path: '$product_id.typeDiscount', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'datatypes',
      let: { typeMovement_id: '$typeMovement_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$typeMovement_id']
            }
          }
        },
        {
          $project: {
            name: 1
          }
        }
      ],
      as: 'typeMovement_id'
    })
    .unwind({ path: '$typeMovement_id', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'orders',
      let: { order_id: '$order_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$order_id']
            }
          }
        },
        {
          $project: {
            name: 1
          }
        }
      ],
      as: 'order_id'
    })
    .unwind({ path: '$order_id', preserveNullAndEmptyArrays: true })
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
    .unwind({ path: '$featureDetail_id', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'features',
      localField: 'featureDetail_id.parentId',
      foreignField: '_id',
      as: 'featureDetail_id.parentId'
    })
    .unwind({ path: '$featureDetail_id.parentId', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'datatypes',
      localField: 'featureDetail_id.parentId.typeFeature_id',
      foreignField: '_id',
      as: 'featureDetail_id.parentId.typeFeature_id'
    })
    .unwind({ path: '$featureDetail_id.parentId.typeFeature_id', preserveNullAndEmptyArrays: true })
    .lookup({
      from: 'managerfiles',
      localField: 'managerFile_id',
      foreignField: '_id',
      as: 'managerFile_id'
    })
    .group({
      _id: '$_id',
      balance: {
        $first: '$balance'
      },
      cost: {
        $first: '$cost'
      },
      managerFile_id: {
        $first: '$managerFile_id'
      },
      created: {
        $first: '$created'
      },
      featureDetail_id: {
        $push: '$featureDetail_id'
      },
      modified: {
        $first: '$modified'
      },
      price: {
        $first: '$price'
      },
      product_id: {
        $first: '$product_id'
      },
      quantity: {
        $first: '$quantity'
      },
      status: {
        $first: '$status'
      },
      typeMovement_id: {
        $first: '$typeMovement_id'
      }
    })
    .match(processFilter)
    .sort(processSort)
    .exec(async function (err, results) {
      const globalDiscount = await ManagerConfiguration.findOne(
        { friendly: 'global_discount' },
        { value: 1 }
      );
      var listDiscountId;

      if (req.user && req.user.listDiscounts) {
        listDiscountId = req.user.listDiscounts;
      }
      // eslint-disable-next-line radix
      const valueGlobalDisc = globalDiscount ? parseInt(globalDiscount.value) : 0;

      var array = [];

      results.forEach((item) => {
        array.push(applyDiscount(item, valueGlobalDisc, listDiscountId));
      });

      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        return res.json(array);
      }
    });
};

function applyDiscount(obj, valueGlobalDisc, listDiscountId) {
  if (obj.product_id.typeDiscount && obj.price) {
    switch (obj.product_id.typeDiscount.nameLang) {
      case 'global':
        obj.oldPrice = obj.price;
        var valueDiscount = Math.trunc(obj.price - (obj.price * valueGlobalDisc) / 100);
        obj.price = Math.ceil(valueDiscount / 50) * 50;
        break;
      case 'individual':
        obj.oldPrice = obj.price;
        var priceIndividual = Math.trunc(
          obj.price - (obj.price * obj.product_id.localDiscount.discountValue) / 100
        );
        obj.price = Math.ceil(priceIndividual / 50) * 50;
        break;
      case 'listPrice':
        var listPrice = obj.product_id.discountList_id.filter((itemList) =>
          itemList._id.equals(listDiscountId)
        );
        // eslint-disable-next-line eqeqeq
        if (listPrice[0] && listPrice[0].newPrice != obj.price) {
          obj.oldPrice = obj.price;
          var price = Math.trunc(obj.price - (obj.price * listPrice[0].discountValue) / 100);
          obj.price = Math.ceil(price / 50) * 50;
        }
        break;
    }
  }

  return obj;
}

/**
 * Movement findAll
 */
exports.findDetail = async function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.query._id)) {
    return res.status(400).send({
      message: 'Movement is invalid'
    });
  }
  var rst = await Movement.findById(req.query._id)
    .populate({ path: 'modifiedBy', select: ['displayName'] })
    .populate({ path: 'user', select: ['displayName'] })
    .populate({ path: 'product_id', select: ['productLang'] })
    .populate({ path: 'featureDetail_id', select: ['nameLang'] })
    .populate({ path: 'typeMovement_id', select: ['nameLang'] })
    .populate({ path: 'order_id', select: ['name'] })
    .populate({ path: 'shop', select: ['name'] })
    .exec();

  if (!rst) {
    return res.status(404).send({
      message: 'No movement with that identifier has been found'
    });
  }

  var movementDetail = await Movement.find({
    featureDetail_id: { $eq: rst.featureDetail_id },
    product_id: rst.product_id
  })
    .populate({ path: 'modifiedBy', select: ['displayName'] })
    .populate({ path: 'user', select: ['displayName'] })
    .populate({ path: 'product_id', select: ['productLang'] })
    .populate({ path: 'featureDetail_id', select: ['nameLang'] })
    .populate({ path: 'typeMovement_id', select: ['nameLang'] })
    .populate({ path: 'order_id', select: ['name'] })
    .populate({ path: 'shop', select: ['name'] })
    .sort({ created: -1 })
    .exec();

  var results = new Movement().processDetails(rst, movementDetail);
  res.json(results);
};
