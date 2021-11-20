'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chalk = require('chalk');

/**
 * Category Schema
 */
const CategorySchema = new Schema({
  categoryLang: [
    {
      name: String,
      lang_id: {
        type: Schema.ObjectId,
        ref: 'Lang'
      },
      description: String,
      linkRewrite: String,
      metaTitle: String,
      metaKeywords: String,
      metaDescription: String
    }
  ],
  order: {
    type: Number,
    default: null
  },
  parent: {
    type: Schema.ObjectId,
    ref: 'Category',
    default: null
  },
  ancestors: [
    {
      _id: {
        type: Schema.ObjectId,
        ref: 'Category'
      },
      categoryLang: [
        {
          name: String,
          lang_id: {
            type: Schema.ObjectId,
            ref: 'Lang'
          },
          description: String,
          linkRewrite: String,
          metaTitle: String,
          metaKeywords: String,
          metaDescription: String
        }
      ]
    }
  ],
  managerFile_id: [
    {
      type: Schema.ObjectId,
      ref: 'ManagerFile'
    }
  ],
  outstanding: {
    type: Boolean,
    default: false
  },
  showSection: {
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
CategorySchema.methods.processLanguaje = function (arrayResults, languageCode) {
  if (!languageCode) {
    return arrayResults;
  }

  arrayResults.forEach((element) => {
    const dataProvitionalLang = element.categoryLang[0].lang_id.languageCode;

    const dataW = element.categoryLang.filter(
      (number) => number.lang_id.languageCode === languageCode
    );

    const arr = element.categoryLang.filter(
      (number) => number.lang_id.languageCode === dataProvitionalLang
    );

    element.categoryLang = dataW.length > 0 ? dataW : arr;
  });

  return arrayResults;
};

CategorySchema.methods.processFilter = function (params) {
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
  let date1;
  let date2;

  for (const field in CategorySchema.paths) {
    if (!CategorySchema.paths.hasOwnProperty(field)) {
      continue;
    }

    if (params[field] === '' || params[field] === null) {
      delete params[field];
      continue;
    }

    if (field === 'parent' && params.parent) {
      params.parent = mongoose.Types.ObjectId(params.parent);
    }

    if (field === 'managerFile_id' && params.managerFile_id) {
      params.managerFile_id = mongoose.Types.ObjectId(params.managerFile_id);
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

    if (CategorySchema.paths[field].instance === 'Number') {
      params[field] = parseFloat(params[field], 10);
    }
  }
  return params;
};

CategorySchema.methods.processPopulate = function (params) {
  if (!params || typeof params === 'undefined') {
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

  if (typeof params !== 'object') {
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

    for (let index = 0; index < params.length; index++) {
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

CategorySchema.methods.processSort = function (params) {
  if (!params || typeof params === 'undefined') {
    return {
      modified: -1
    };
  }

  if (typeof params === 'string') {
    params = JSON.parse(params);
  }

  if (typeof params !== 'object') {
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
    if (params[property] === 'desc') {
      params[property] = -1;
    } else {
      params[property] = 1;
    }
  }

  return params;
};

CategorySchema.methods.buildAncestors = async function (id, parentId) {
  try {
    const parentCategory = await mongoose
      .model('Category')
      .findOne({ _id: parentId }, { categoryLang: 1, ancestors: 1 })
      .lean()
      .exec();

    if (parentCategory) {
      const { _id, categoryLang } = parentCategory;
      const ancest = [...parentCategory.ancestors];
      ancest.unshift({ _id, categoryLang });
      return ancest;
    }
    return [];
  } catch (err) {
    console.log(err.message);
  }
};

CategorySchema.methods.buildOrder = async function (parentId) {
  try {
    const countChildsCategory = await mongoose
      .model('Category')
      .find({ parent: parentId })
      .count()
      .exec();

    return countChildsCategory + 1;
  } catch (err) {
    console.log(err.message);
  }
};

CategorySchema.methods.updateOrder = async function (oldOrder, newOrder, data) {
  try {
    var childsCategory;
    var countOrder;
    if (newOrder < oldOrder) {
      childsCategory = await mongoose
        .model('Category')
        .find({ parent: data.parent, order: { $gte: newOrder }, _id: { $ne: data._id } })
        .lean()
        .sort({ order: 'asc' })
        .exec();

      if (childsCategory.length === 0) {
        return newOrder;
      }

      countOrder = newOrder;
      await asyncForEach(childsCategory, async function (value) {
        countOrder++;

        await mongoose
          .model('Category')
          .update({ _id: value._id }, { $set: { order: countOrder } })
          .exec();
      });

      return newOrder;
    } else if (newOrder > oldOrder) {
      const countChildsCategory = await mongoose
        .model('Category')
        .find({ parent: data.parent })
        .count()
        .exec();

      if (countChildsCategory < newOrder) {
        newOrder = countChildsCategory;
      }

      childsCategory = await mongoose
        .model('Category')
        .find({
          parent: data.parent,
          order: { $gte: oldOrder, $lte: newOrder },
          _id: { $ne: data._id }
        })
        .lean()
        .sort({ order: 'asc' })
        .exec();

      if (childsCategory.length === 0) {
        return newOrder;
      }

      countOrder = oldOrder;

      await asyncForEach(childsCategory, async function (value) {
        await mongoose
          .model('Category')
          .update({ _id: value._id }, { $set: { order: countOrder } })
          .exec();

        countOrder++;
      });

      return newOrder;
    } else {
      return oldOrder;
    }
  } catch (err) {
    console.log(err.message);
  }
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

CategorySchema.methods.processChild = function (todos, padre) {
  var childs = [];

  todos.forEach((element) => {
    if (String(element.parent) === String(padre._id)) {
      childs.push({
        parent: element.parent,
        _id: element._id,
        categoryLang: element.categoryLang[0].name,
        ancestors: element.ancestors,
        childs: this.processChild(todos, element)
      });
    }
  });

  return childs;
};

CategorySchema.methods.processSelect = function (todos) {
  var arrayFinal = [];

  todos.forEach((i) => {
    var arrayW = [];
    var lengthAncestors = i.ancestors.length;
    var guiones = '';

    for (let k = 0; k < lengthAncestors; k++) {
      guiones += ' - ';
    }

    i.categoryLang.forEach((j) => {
      arrayW.push({ name: guiones + j.name, _id: j.lang_id, originalName: j.name });
    });

    arrayFinal.push({
      parent: i.parent,
      _id: i._id,
      categoryLang: arrayW,
      depth: lengthAncestors,
      managerFile_id: i.managerFile_id,
      order: i.order
    });
  });

  arrayFinal.sort(function (a, b) {
    if (a.depth < b.depth) return -1;

    if (a.depth > b.depth) return 1;

    return 0;
  });

  var arrayWW = [];

  arrayFinal.forEach((i) => {
    let slug;
    if (i.parent) {
      slug = i.order >= 10 ? String('_' + i.order) : String(i.order);
    } else {
      slug = '0';
    }

    if (i.parent) {
      for (let j = 0; j < arrayWW.length; j++) {
        if (String(arrayWW[j]._id) === String(i.parent)) {
          slug = arrayWW[j].slug + '_' + slug;
        }
      }
    }

    arrayWW.push({
      parent: i.parent,
      _id: i._id,
      categoryLang: i.categoryLang,
      managerFile_id: i.managerFile_id,
      depth: i.depth,
      order: i.order,
      slug: slug
    });
  });

  arrayWW.sort(function (a, b) {
    if (a.slug < b.slug) {
      return -1;
    }

    if (a.slug > b.slug) {
      return 1;
    }

    return 0;
  });

  return arrayWW;
};

CategorySchema.statics.seed = seed;

mongoose.model('Category', CategorySchema);

/**
 * Seeds the User collection with document (Category)
 * and provided options.
 */
function seed(doc, options) {
  var Category = mongoose.model('Category');

  return new Promise(function (resolve, reject) {
    skipDocument()
      .then(findAdminUser)
      .then(findManagerFile)
      .then(findLang)
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function findLang(skip) {
      var Lang = mongoose.model('Lang');

      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve(true);
        }

        var arrayFind = [];

        doc.categoryLang.forEach((element) => {
          arrayFind.push(element.languageCode);
        });

        Lang.find({
          languageCode: { $in: arrayFind }
        }).exec(function (err, managerFile) {
          if (err) {
            return reject(err);
          }

          doc.categoryLang.forEach((elementDoc, indexDoc) => {
            managerFile.forEach((elementData) => {
              if (elementDoc.languageCode === elementData.languageCode) {
                doc.categoryLang[indexDoc].lang_id = elementData._id;
              }
            });
          });

          return resolve();
        });
      });
    }

    function findManagerFile(skip) {
      var ManagerFile = mongoose.model('ManagerFile');

      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve(true);
        }

        ManagerFile.findOne({
          filename: doc.managerFile_id
        }).exec(function (err, managerFile) {
          if (err) {
            return reject(err);
          }

          doc.managerFile_id = managerFile;

          return resolve();
        });
      });
    }

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
        Category.findOne({
          categoryLang: doc.categoryLang
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

          // Remove Category (overwrite)

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
            message: chalk.yellow('Database Seeding: Category\t' + doc.categoryLang + ' skipped')
          });
        }

        var category = new Category(doc);

        category.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Category\t' + category.categoryLang + ' added'
          });
        });
      });
    }
  });
}
