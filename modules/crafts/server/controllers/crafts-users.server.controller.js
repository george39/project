'use strict';

/**
 * Module dependencies
 */
const path = require('path');
const mongoose = require('mongoose');
const CraftsUsers = mongoose.model('CraftsUsers');
const Craft = mongoose.model('Craft');
const Lang = mongoose.model('Lang');
const config = require(path.resolve('./config/config.js'));
const md5 = require('md5');
const errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an CraftUser
 */
exports.create = function (req, res) {
  var craftsUsers = new CraftsUsers(req.body);
  craftsUsers.user_id = req.user._id;
  craftsUsers.shop = req.user.shop;

  craftsUsers.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(craftsUsers);
    }
  });
};

exports.purchase = async (req, res) => {
  console.log('req.body');
  console.log(req.body);
  console.log('req.body');

  console.log('md5');
  console.log(md5(config.payBinlab.secretKey + JSON.stringify(req.body.Affiliate)));
  console.log('md5');

  if (md5(config.payBinlab.secretKey + JSON.stringify(req.body.Affiliate)) === req.body.single) {
    console.log('entrando en el if');
    const craftUser = await CraftsUsers.findOne({ _id: mongoose.Types.ObjectId(req.body.custom) });

    if (craftUser) {
      console.log('orden encontrada');
      const status = req.body.Transaction.messageshort === 'Aprobada';

      if (status && req.body.Transaction.amount === craftUser.price) {
        console.log('estatus full');
        CraftsUsers.update(
          { _id: mongoose.Types.ObjectId(req.body.custom) },
          { $set: { status: true } }
        ).exec(async (err, success) => {
          if (err) {
            return res.status(422).send({
              message: errorHandler.getErrorMessage(err)
            });
          }
          console.log('!!todo correcto');
          craftUser.status = true;
          return res.status(200).json(craftUser);
        });
      } else {
        return res.status(400).json({ message: 'Incorrect status or amount' });
      }
    }
  } else {
    return res.status(400).json({ message: 'Incorrect sign' });
  }
};

// /**
//  * Show the current Craft
//  */
// exports.read = function (req, res) {
//   // convert mongoose document to JSON
//   var craft = req.craft ? req.craft.toJSON() : {};

//   // Add a custom field to the Craft, for determining if the current User is the "owner".
//   // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Craft model.
//   craft.isCurrentUserOwner = !!(
//     req.user &&
//     craft.user &&
//     craft.user._id.toString() === req.user._id.toString()
//   );
//   return res.json(craft);
// };

/**
 * Update an Craft
 */
// exports.update = function (req, res) {
//   var craft = req.craft;

//   craft.name = req.body.name;
//   craft.image = req.body.image;
//   craft.materials = req.body.materials;
//   craft.description = req.body.description;
//   craft.isFree = req.body.isFree;
//   craft.price = req.body.price;
//   craft.modifiedBy = req.user._id;
//   craft.category_id = req.body.category_id;
//   craft.modified = Date();

//   if (req.body.urlVideo) {
//     craft.urlVideo = new Craft().processUrlVideo(req.body.urlVideo);
//   }

//   if (req.body.steps) {
//     craft.steps = req.body.steps;
//   }

//   craft.save(function (err) {
//     if (err) {
//       return res.status(422).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       return res.json(craft);
//     }
//   });
// };

/**
 * Delete an Craft
 */
exports.delete = function (req, res) {
  var craft = req.craft;

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

/**
 * List of Crafts
 */
// exports.list = async function (req, res) {
//   const lang = req.query.lang || 'es';
//   const count = req.query.count || 100;
//   const page = req.query.page || 1;
//   const sort = req.query.sorting || { modified: 'desc' };
//   const populate = req.query.populate || [];
//   const filter = req.query.filter || {};

//   var processFilter = new Craft().processFilter(filter);
//   var processPopulate = new Craft().processPopulate(populate);
//   var processSort = new Craft().processSort(sort);

//   // if (req.user.roles.indexOf('admin') === -1) {
//   //   processFilter.shop = req.user.shop;
//   // }

//   Craft.aggregate([
//     {
//       $lookup: {
//         from: 'managerfiles',
//         localField: 'image',
//         foreignField: '_id',
//         as: 'image'
//       }
//     },
//     {
//       $unwind: {
//         path: '$image'
//       }
//     },
//     {
//       $unwind: {
//         path: '$steps'
//       }
//     },
//     {
//       $lookup: {
//         from: 'managerfiles',
//         localField: 'steps.image',
//         foreignField: '_id',
//         as: 'steps.image'
//       }
//     },
//     {
//       $unwind: {
//         path: '$steps.image'
//       }
//     },
//     {
//       $lookup: {
//         from: 'products',
//         localField: 'materials',
//         foreignField: '_id',
//         as: 'materials'
//       }
//     },
//     {
//       $lookup: {
//         from: 'categories',
//         localField: 'category_id',
//         foreignField: '_id',
//         as: 'category_id'
//       }
//     },
//     {
//       $unwind: {
//         path: '$category_id'
//       }
//     },
//     {
//       $match: processFilter
//     },
//     {
//       $group: {
//         _id: '$_id',
//         steps: {
//           $push: '$steps'
//         },
//         category_id: {
//           $first: '$category_id'
//         },
//         name: {
//           $first: '$name'
//         },
//         description: {
//           $first: '$description'
//         },
//         image: {
//           $first: '$image'
//         },
//         urlVideo: {
//           $first: '$urlVideo'
//         },
//         materials: {
//           $first: '$materials'
//         },
//         isFree: {
//           $first: '$isFree'
//         },
//         price: {
//           $first: '$price'
//         },
//         modified: {
//           $first: '$modified'
//         }
//       }
//     },
//     {
//       $sort: processSort
//     },
//     {
//       $facet: {
//         metadata: [{ $count: 'total' }],
//         // eslint-disable-next-line radix
//         results: [{ $skip: parseInt((page - 1) * count) }, { $limit: parseInt(count) }]
//       }
//     }
//   ]).exec(async function (err, crafts) {
//     if (err) {
//       return res.status(422).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     }

//     const langs = await Lang.find({});
//     const objLangs = {};
//     langs.forEach((_lang) => {
//       objLangs[_lang._id] = _lang;
//     });

//     crafts[0].results.forEach((item) => {
//       const newLang = item.category_id.categoryLang.filter(
//         (catLang) => objLangs[catLang.lang_id].languageCode === lang
//       );
//       item.category_id.categoryLang = newLang[0] || item.category_id.categoryLang[0];
//     });

//     const result = {
//       count,
//       page,
//       filter: processFilter,
//       sort: processSort,
//       results: crafts[0].results
//     };

//     return res.status(200).json(result);
//   });
// };

/**
 * Craft middleware
 */
// exports.craftByID = function (req, res, next, id) {
//   const lang = req.query.lang || 'es';

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).send({
//       message: 'Craft is invalid'
//     });
//   }

//   Craft.findById(id)
//     .populate('modifiedBy', 'displayName')
//     .populate('user', 'displayName')
//     .populate('steps.image')
//     .populate('image')
//     .populate('category_id')
//     .populate({
//       path: 'materials',
//       select: 'productLang',
//       populate: {
//         path: 'productLang.lang_id',
//         select: 'languageCode'
//       }
//     })
//     .exec(function (err, craft) {
//       if (err) {
//         return next(err);
//       } else if (!craft) {
//         return res.status(404).send({
//           message: 'No craft with that identifier has been found'
//         });
//       }

//       craft.materials.forEach((material) => {
//         var productLang = material.productLang.filter(
//           (language) => language.lang_id.languageCode === lang
//         );

//         material.productLang = productLang[0] || [material.productLang[0]];
//       });

//       req.craft = craft;
//       next();
//     });
// };
