'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var Category = mongoose.model('Category');
var errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Category
 */
exports.create = async function (req, res) {
  var category = new Category(req.body);
  category.user = req.user._id;
  category.shop = req.user.shop;
  category.ancestors = await new Category().buildAncestors(category._id, category.parent);
  category.order = await new Category().buildOrder(category.parent);

  category.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(category);
    }
  });
};

/**
 * Show the current Category
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var category = req.category ? req.category.toJSON() : {};

  // Add a custom field to the Category, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Category model.
  category.isCurrentUserOwner = !!(
    req.user &&
    category.user &&
    category.user._id.toString() === req.user._id.toString()
  );

  res.json(category);
};

/**
 * Update an Category
 */
exports.update = async function (req, res) {
  if (req.body.parent._id === req.body._id) {
    return res
      .status(422)
      .json({ message: 'No se puede poner una categoría dentro de ella misma' });
  }

  const parent = await Category.findOne({ _id: req.body.parent._id });
  if (parent) {
    const parentAncestors = parent.ancestors.map((item) => item._id);
    const ancestors = await Category.find({ _id: { $in: parentAncestors } });

    const match = ancestors.filter((item) => item._id.equals(req.category._id));

    if (match.length > 0) {
      return res
        .status(422)
        .json({ message: 'No se puede poner una categoría dentro de una de sus categorías hijas' });
    }
  }

  var category = req.category;
  var orderOld = req.category.order ? req.category.order : 1;
  var orderNew = req.body.order;

  category.categoryLang = req.body.categoryLang;
  category.parent = req.body.parent;
  category.ancestors = req.body.ancestors;
  category.managerFile_id = req.body.managerFile_id;
  category.outstanding = req.body.outstanding;
  category.showSection = req.body.showSection;
  category.status = req.body.status;
  category.modifiedBy = req.user._id;
  category.modified = Date();
  category.order = await new Category().updateOrder(orderOld, orderNew, req.body);

  category.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(category);
    }
  });
};

/**
 * Delete an Category
 */
exports.delete = function (req, res) {
  var category = req.category;

  category.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(category);
    }
  });
};

/**
 * List of Categories
 */
exports.list = async function (req, res) {
  var languageCode = req.query.lang;
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Category().processFilter(filter);
  var processPopulate = new Category().processPopulate(populate);
  var processSort = new Category().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.shop = req.user.shop;
  }

  if (!processFilter.parent && req.user.roles.indexOf('admin') === -1) {
    var parentFilter = await Category.findOne({ parent: null }).exec();
    processFilter.parent = parentFilter._id;
  }

  var options = {
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

  Category.find()
    .populate(processPopulate.path, processPopulate.select)
    .populate({ path: 'categoryLang.lang_id', select: 'languageCode' })
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, categories) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        categories.results = new Category().processLanguaje(categories.results, languageCode);
        return res.json(categories);
      }
    });
};

/**
 * List of Categories
 */
exports.findAll = function (req, res) {
  var languageCode = req.query.lang;
  const sort = req.query.sorting || { modified: 'desc' };
  const filter = req.query.filter || {};

  const processFilter = new Category().processFilter(filter);
  const processSort = new Category().processSort(sort);

  // if (req.user.roles.indexOf('admin') === -1) {
  //   processFilter.shop = req.user.shop;
  // }

  Category.aggregate([
    {
      $unwind: {
        path: '$categoryLang',
        preserveNullAndEmptyArrays: true
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
        order: {
          $first: '$order'
        },
        parent: {
          $first: '$parent'
        },
        managerFile_id: {
          $first: '$managerFile_id'
        },
        outstanding: {
          $first: '$outstanding'
        },
        status: {
          $first: '$status'
        },
        shop: {
          $first: '$shop'
        },
        categoryLang: {
          $push: '$categoryLang'
        },
        ancestors: {
          $first: '$ancestors'
        },
        created: {
          $first: '$created'
        },
        modified: {
          $first: '$modified'
        }
      }
    },
    {
      $unwind: {
        path: '$managerFile_id',
        preserveNullAndEmptyArrays: true
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
      $match: processFilter
    },
    {
      $sort: processSort
    }
  ]).exec(function (err, categories) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      categories = new Category().processLanguaje(categories, languageCode);
      const categoriesW = new Category().processSelect(categories);
      return res.json(categoriesW);
    }
  });
};

/**
 * @author Jonathan Correa
 *
 * @param {object} req
 * @param {object} res
 *
 * @return {object} Retorna las categorias ordenadas solo hasta
 * el tercer nivel.
 */
exports.findCategories = async (req, res) => {
  const aggregate = [
    {
      $match: {
        status: true,
        'categoryLang.name': {
          $not: { $regex: 'manualidades', $options: 'i' }
        },
        'ancestors.categoryLang.name': {
          $not: { $regex: 'manualidades', $options: 'i' }
        }
      }
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
        path: '$categoryLang.lang_id'
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
      $group: {
        _id: '$_id',
        parent: {
          $first: '$parent'
        },
        managerFile_id: {
          $first: '$managerFile_id'
        },
        ancestors: {
          $first: '$ancestors'
        },
        categoryLang: {
          $push: '$categoryLang'
        },
        order: {
          $first: '$order'
        }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'parent',
        foreignField: '_id',
        as: 'parent'
      }
    },
    {
      $unwind: {
        path: '$parent',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$parent.categoryLang'
      }
    },
    {
      $lookup: {
        from: 'langs',
        localField: 'parent.categoryLang.lang_id',
        foreignField: '_id',
        as: 'parent.categoryLang.lang_id'
      }
    },
    {
      $unwind: {
        path: '$parent.categoryLang.lang_id'
      }
    },
    {
      $lookup: {
        from: 'managerfiles',
        localField: 'parent.managerFile_id',
        foreignField: '_id',
        as: 'parent.managerFile_id'
      }
    },
    {
      $group: {
        _id: '$_id',
        parent: {
          $first: '$parent'
        },
        parentLang: {
          $push: '$parent.categoryLang'
        },
        order: {
          $first: '$order'
        },
        ancestors: {
          $first: '$ancestors'
        },
        managerFile_id: {
          $first: '$managerFile_id'
        },
        categoryLang: {
          $first: '$categoryLang'
        }
      }
    },
    {
      $group: {
        _id: {
          parent: '$parent'
        },
        items: {
          $push: '$$ROOT'
        }
      }
    }
  ];

  try {
    const response = await Category.aggregate(aggregate);
    const obj = {};
    const childs = {};

    const flag = req.query.lang;
    var categoryLang;

    response.forEach((element) => {
      if (element._id.parent) {
        // Ordenar las categorías y verificar que tengan el idioma requerido, si no lo tienen
        // se les asigna uno por defecto
        element.items.forEach((item) => {
          if (item.ancestors.length === 1 && !obj.hasOwnProperty(item._id)) {
            categoryLang = item.categoryLang.filter((i) => i.lang_id.languageCode === flag);
            obj[item._id] = {
              _id: item._id,
              categoryLang: categoryLang[0] ? categoryLang[0] : item.categoryLang[0],
              managerFile_id: item.managerFile_id,
              hasChilds: false,
              order: item.order,
              items: {}
            };
          }

          if (item.ancestors.length === 2) {
            if (!obj.hasOwnProperty(item.parent._id)) {
              categoryLang = item.parentLang.filter((i) => i.lang_id.languageCode === flag);
              obj[item.parent._id] = {
                _id: item.parent._id,
                categoryLang: categoryLang[0] ? categoryLang[0] : item.parentLang[0],
                managerFile_id: item.parent.managerFile_id,
                hasChilds: false,
                order: item.parent.order,
                items: {}
              };
            }

            categoryLang = item.categoryLang.filter((i) => i.lang_id.languageCode === flag);
            obj[item.parent._id].items[item._id] = {
              _id: item._id,
              categoryLang: categoryLang[0] ? categoryLang[0] : item.categoryLang[0],
              managerFile_id: item.managerFile_id,
              hasChilds: false,
              order: item.order,
              parent: item.parent,
              items: {}
            };
            obj[item.parent._id].hasChilds = true;
          }

          if (item.ancestors.length === 3) {
            categoryLang = item.categoryLang.filter((i) => i.lang_id.languageCode === flag);
            childs[item._id] = {
              _id: item._id,
              parent: item.parent,
              managerFile_id: item.managerFile_id,
              order: item.order,
              categoryLang: categoryLang[0] ? categoryLang[0] : item.categoryLang[0]
            };
          }
        });
      }
    });

    for (const key in childs) {
      if (!childs.hasOwnProperty(key)) continue;

      obj[childs[key].parent.parent._id].items[childs[key].parent._id].items[key] = childs[key];
      obj[childs[key].parent.parent._id].items[childs[key].parent._id].hasChilds = true;
    }

    var array = [];

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      const newObj = obj[key];

      newObj.items = createArray(newObj.items);
      for (var index = 0; index < newObj.items.length; index++) {
        newObj.items[index].items = createArray(newObj.items[index].items);
      }

      array.push(newObj);
    }

    return res.json(array);
  } catch (err) {
    return res.status(500).json({
      message: 'Something wrong just happend!'
    });
  }
};

/**
 * @param {object} object
 * @returns {object[]} array
 */
function createArray(obj) {
  var array = [];
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    array.push(obj[key]);
  }

  return array;
}

/**
 * Category middleware
 */
exports.categoryByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Category is invalid'
    });
  }

  Category.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user shop', 'displayName name')
    .populate({ path: 'managerFile_id', select: ['originalname', 'path'] })
    .populate({ path: 'parent', select: ['categoryLang'] })
    .exec(function (err, category) {
      if (err) {
        return next(err);
      } else if (!category) {
        return res.status(404).send({
          message: 'No category with that identifier has been found'
        });
      }
      req.category = category;
      next();
    });
};

exports.getCraftsCategories = async (req, res) => {
  const lang = req.query.lang || 'es';
  const craftParent = await Category.findOne({
    'categoryLang.name': { $regex: 'manualidades', $options: 'i' },
    status: true
  });

  if (craftParent) {
    var categories = await Category.find({ parent: craftParent._id })
      .populate({ path: 'categoryLang.lang_id', select: 'languageCode' })
      .populate({ path: 'managerFile_id', select: 'path originalname' });

    categories = new Category().processLanguaje(categories, lang);

    return res.status(200).json(categories);
  } else {
    return res.status(200).json([]);
  }
};
