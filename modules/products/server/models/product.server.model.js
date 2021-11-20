'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chalk = require('chalk');

const validateLinkRewrite = async function (v) {
  const data = await mongoose
    .model('Product')
    .find({
      'seo._id': { $ne: this._id },
      'seo.linkRewrite': v
    })
    .count()
    .exec();

  return data === 0;
};

/**
 * Product Schema
 */
const ProductSchema = new Schema({
  category_id: [
    {
      type: Schema.ObjectId,
      ref: 'Category'
    }
  ],
  productLang: [
    {
      name: String,
      lang_id: {
        type: Schema.ObjectId,
        ref: 'Lang'
      },
      description: {
        type: String,
        maxlength: [160, 'Solo 160 Caracteres']
      }
    }
  ],
  seo: [
    {
      linkRewrite: {
        type: String,
        validate: {
          validator: validateLinkRewrite,
          message: (props) => `${props.value} is not unique!`
        }
      },
      metaTitle: String,
      metaKeywords: String,
      metaDescription: String
    }
  ],
  managerFile_id: [
    {
      type: Schema.ObjectId,
      ref: 'ManagerFile'
    }
  ],
  tax_id: {
    type: Schema.ObjectId,
    ref: 'Tax'
  },
  priceTaxIncluded: {
    type: Number
  },
  maker_id: {
    type: Schema.ObjectId,
    ref: 'Third'
  },
  provider_id: {
    type: Schema.ObjectId,
    ref: 'Third'
  },
  barCode: {
    type: String
  },
  code: {
    type: String
  },
  typeCombination: {
    type: Number
  },
  quantity: {
    type: Number
  },
  quantityMin: {
    type: Number
  },
  cost: {
    type: Number
  },
  price: {
    type: Number
  },
  profit: {
    type: Number
  },
  typeDiscount: {
    type: Schema.ObjectId,
    ref: 'DataType'
  },
  localDiscount: {
    typeDiscount: {
      type: Schema.ObjectId,
      ref: 'DataType'
    },
    discountValue: Number,
    newPrice: Number
  },
  discountList_id: [
    {
      _id: {
        type: Schema.ObjectId,
        ref: 'DiscountList'
      },
      name: String,
      typeDiscount: {
        type: Schema.ObjectId,
        ref: 'DataType'
      },
      discountValue: Number,
      newPrice: Number
    }
  ],
  shippingData: {
    shipper_id: [
      {
        type: Schema.ObjectId,
        ref: 'Third'
      }
    ],
    width: Number,
    height: Number,
    depth: Number,
    weight: Number
  },
  showPrice: {
    type: Boolean,
    default: false
  },
  onlineOnly: {
    type: Boolean,
    default: false
  },
  isOffer: {
    type: Boolean,
    default: false
  },
  availableNow: {
    type: Boolean,
    default: false
  },
  show_in_sections_by_category: {
    type: Boolean,
    default: false
  },
  deliveryInStock: {
    type: Boolean,
    default: false
  },
  deliveryIsFree: {
    type: Boolean,
    default: false
  },
  outstanding: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: false
  },
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
ProductSchema.methods.processFilter = function (params) {
  if (!params || typeof params === 'undefined') {
    return {};
  }

  if (typeof params === 'string') {
    params = JSON.parse(params);
  }

  if (typeof params !== 'object') {
    return {};
  }

  if (Object.keys(params).length === 0) {
    return {};
  }

  const moment = require('moment');
  var date1;
  var date2;

  for (const field in ProductSchema.paths) {
    if (!ProductSchema.paths.hasOwnProperty(field)) {
      continue;
    }

    if (params[field] === '' || params[field] === null) {
      delete params[field];
      continue;
    }

    if (field === 'category_id' && params.category_id && typeof params.category_id !== 'object') {
      params.category_id = mongoose.Types.ObjectId(params.category_id);
    }

    if (
      field === 'category_id' &&
      params['product.category_id._id'] &&
      !params['product.category_id.parent']
    ) {
      params['product.category_id._id'] = mongoose.Types.ObjectId(
        params['product.category_id._id']
      );
    }

    if (
      field === 'category_id' &&
      params['product.category_id.parent'] &&
      params['product.category_id._id']
    ) {
      params.$or = [
        {
          'product.category_id.ancestors._id': mongoose.Types.ObjectId(
            params['product.category_id.parent']
          )
        },
        {
          'product.category_id._id': mongoose.Types.ObjectId(params['product.category_id._id'])
        }
      ];

      delete params['product.category_id.parent'];
      delete params['product.category_id._id'];
    }

    if (field === 'managerFile_id' && params.managerFile_id) {
      params.managerFile_id = mongoose.Types.ObjectId(params.managerFile_id);
    }

    if (field === 'tax_id' && params.tax_id) {
      params.tax_id = mongoose.Types.ObjectId(params.tax_id);
    }

    if (field === 'maker_id' && params.maker_id) {
      params.maker_id = mongoose.Types.ObjectId(params.maker_id);
    }

    if (field === 'provider_id' && params.provider_id) {
      params.provider_id = mongoose.Types.ObjectId(params.provider_id);
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

    if (ProductSchema.paths[field].instance === 'Number') {
      params[field] = parseFloat(params[field], 10);
    }
  }
  return params;
};

ProductSchema.methods.processPopulate = function (params) {
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

ProductSchema.methods.processSort = function (params) {
  if (!params || typeof params == 'undefined') {
    return {
      created: -1
    };
  }

  if (typeof params == 'string') {
    params = JSON.parse(params);
  }

  if (typeof params != 'object') {
    return {
      created: -1
    };
  }

  if (Object.keys(params).length === 0) {
    return {
      created: -1
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

ProductSchema.statics.seed = seed;

module.exports = mongoose.model('Product', ProductSchema);

/**
 * Seeds the User collection with document (Product)
 * and provided options.
 */
function seed(doc, options) {
  var Product = mongoose.model('Product');

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
        Product.findOne({
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

          // Remove Product (overwrite)

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
            message: chalk.yellow('Database Seeding: Product\t' + doc.title + ' skipped')
          });
        }

        var product = new Product(doc);

        product.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Product\t' + product.title + ' added'
          });
        });
      });
    }
  });
}
