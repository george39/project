'use strict';

/**
 * Module dependencies
 */
const path = require('path');
const mongoose = require('mongoose');
const Craft = mongoose.model('Craft');
const CraftsUsers = mongoose.model('CraftsUsers');
const Lang = mongoose.model('Lang');
const errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));
const ManagerFile = require('../../../manager-files/server/models/manager-file.server.model');

/**
 * Create an Craft
 */
exports.create = function (req, res) {
  var craft = new Craft(req.body);
  craft.user = req.user._id;
  craft.shop = req.user.shop;

  if (req.body.urlVideo) {
    craft.urlVideo = new Craft().processUrlVideo(req.body.urlVideo);
  }

  craft.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(craft);
    }
  });
};

/**
 * Show the current Craft
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var craft = req.craft ? req.craft.toJSON() : {};

  // Add a custom field to the Craft, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Craft model.
  craft.isCurrentUserOwner = !!(
    req.user &&
    craft.user &&
    craft.user._id.toString() === req.user._id.toString()
  );
  return res.json(craft);
};

/**
 * Update an Craft
 */
exports.update = function (req, res) {
  var craft = req.craft;

  craft.name = req.body.name;
  craft.image = req.body.image;
  craft.materials = req.body.materials;
  craft.description = req.body.description;
  craft.isFree = req.body.isFree;
  craft.price = req.body.price;
  craft.modifiedBy = req.user._id;
  craft.category_id = req.body.category_id;
  craft.modified = Date();

  if (req.body.urlVideo) {
    craft.urlVideo = new Craft().processUrlVideo(req.body.urlVideo);
  }

  if (req.body.steps) {
    craft.steps = req.body.steps;
  }

  craft.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(craft);
    }
  });
};

/**
 * Delete an Craft
 */
exports.delete = async function (req, res) {
  const craft = req.craft;

  const managerFilesToRemove = [craft.image];

  for (let i = 0; i < craft.steps.length; i++) {
    managerFilesToRemove.push(craft.steps[i].image);
  }

  const managerFile = new ManagerFile();
  console.log(managerFilesToRemove);
  await managerFile.promiseRemoveAllFiles(managerFilesToRemove);

  craft.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(craft);
    }
  });
};

const processLanguage = async (crafts, lang) => {
  const langs = await Lang.find({}); // TODO: Add filter by shop
  const objLangs = {};
  const _crafts = {};
  langs.forEach((_lang) => {
    objLangs[_lang._id] = _lang;
  });

  crafts.forEach((item) => {
    _crafts[item._id] = item;
    const newLang = item.category_id.categoryLang.filter(
      (catLang) => objLangs[catLang.lang_id].languageCode === lang
    );
    _crafts[item._id].category_id.categoryLang =
      newLang[0] || _crafts[item._id].category_id.categoryLang[0];
  });

  return _crafts;
};

async function processCraftsOwned(crafts, req) {
  try {
    if (!req.user) {
      return {
        error: false,
        success: true,
        data: crafts
      };
    }

    const data = await CraftsUsers.find({
      craft_id: { $in: Object.keys(crafts) },
      user_id: req.user._id,
      status: true
    });

    if (data) {
      data.forEach((item) => {
        crafts[item.craft_id].show = true;
      });

      return {
        error: false,
        success: true,
        data: crafts
      };
    }
  } catch (error) {
    return {
      error: true,
      success: false,
      data: error
    };
  }
}

/**
 * List of Crafts
 */
exports.list = async function (req, res) {
  const lang = req.query.lang || 'es';
  const count = req.query.count || 100;
  const page = req.query.page || 1;
  const sort = req.query.sorting || { modified: 'desc' };
  const filter = req.query.filter || {};

  var processFilter = new Craft().processFilter(filter);
  var processSort = new Craft().processSort(sort);

  // if (req.user.roles.indexOf('admin') === -1) {
  //   processFilter.shop = req.user.shop;
  // }

  Craft.aggregate([
    {
      $lookup: {
        from: 'managerfiles',
        localField: 'image',
        foreignField: '_id',
        as: 'image'
      }
    },
    {
      $unwind: {
        path: '$image'
      }
    },
    {
      $unwind: {
        path: '$steps',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'managerfiles',
        localField: 'steps.image',
        foreignField: '_id',
        as: 'steps.image'
      }
    },
    {
      $unwind: {
        path: '$steps.image',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'materials',
        foreignField: '_id',
        as: 'materials'
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
        path: '$category_id'
      }
    },
    {
      $match: processFilter
    },
    {
      $group: {
        _id: '$_id',
        steps: {
          $push: '$steps'
        },
        category_id: {
          $first: '$category_id'
        },
        name: {
          $first: '$name'
        },
        description: {
          $first: '$description'
        },
        image: {
          $first: '$image'
        },
        urlVideo: {
          $first: '$urlVideo'
        },
        materials: {
          $first: '$materials'
        },
        isFree: {
          $first: '$isFree'
        },
        price: {
          $first: '$price'
        },
        modified: {
          $first: '$modified'
        }
      }
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
  ]).exec(async function (err, crafts) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    const results = await processLanguage(crafts[0].results, lang);
    const final = await processCraftsOwned(results, req);

    if (final.error) {
      return res.status(404).send({
        message: errorHandler.getErrorMessage(final.data)
      });
    }

    const result = {
      count,
      page,
      filter: processFilter,
      sort: processSort,
      results: final.data
    };

    return res.status(200).json(result);
  });
};

/**
 * Craft middleware
 */
exports.craftByID = function (req, res, next, id) {
  const lang = req.query.lang || 'es';

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Craft is invalid'
    });
  }

  Craft.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user', 'displayName')
    .populate('steps.image')
    .populate('image')
    .populate('category_id')
    .populate({
      path: 'materials',
      select: 'productLang',
      populate: {
        path: 'productLang.lang_id',
        select: 'languageCode'
      }
    })
    .exec(function (err, craft) {
      if (err) {
        return next(err);
      } else if (!craft) {
        return res.status(404).send({
          message: 'No craft with that identifier has been found'
        });
      }

      craft.materials.forEach((material) => {
        var productLang = material.productLang.filter(
          (language) => language.lang_id.languageCode === lang
        );

        material.productLang = productLang[0] || [material.productLang[0]];
      });

      req.craft = craft;
      next();
    });
};
