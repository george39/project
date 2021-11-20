'use strict';

/**
 * Module dependencies
 */
const path = require('path');
const mongoose = require('mongoose');
const Favorite = mongoose.model('Favorite');
const { getErrorMessage } = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));
const { processFilter, processPopulate, processSort } = require(path.resolve(
  './helpers/model-helpers'
));

/**
 * Create an Favorite
 */
exports.create = async function (req, res) {
  const favorite = new Favorite(req.body);

  const alreadyInFavorites = await Favorite.findOne({
    user: req.body.user,
    product: req.body.product
  })
    .lean()
    .exec();

  if (alreadyInFavorites) {
    return res.status(200).json({ message: 'El producto ya está en la lista de favoritos' });
  }

  favorite.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: getErrorMessage(err)
      });
    } else {
      return res.status(200).json(favorite);
    }
  });
};

/**
 * Show the current Favorite
 */
exports.read = function (req, res) {
  const favorite = req.favorite ? req.favorite.toJSON() : {};

  favorite.isCurrentUserOwner = !!(
    req.user &&
    favorite.user &&
    favorite.user._id.toString() === req.user._id.toString()
  );

  return res.status(200).json(favorite);
};

/**
 * Update an Favorite
 */
exports.update = function (req, res) {
  const favorite = req.favorite;

  favorite.user = req.body.user;
  favorite.product = req.body.product;
  favorite.modifiedBy = req.user._id;
  favorite.modified = Date();

  favorite.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: getErrorMessage(err)
      });
    } else {
      res.status(200).json(favorite);
    }
  });
};

/**
 * Delete an Favorite
 */
exports.delete = async function (req, res) {
  const filter = processFilter(req.query.filter);

  try {
    Favorite.remove(filter);
    return res.status(200).json({ message: 'Producto eliminado de favoritos' });
  } catch (e) {
    return res.status(422).send({
      message: getErrorMessage(e)
    });
  }
};

/**
 * List of Favorites
 */
exports.list = function (req, res) {
  const count = req.query.count || 100;
  const page = req.query.page || 1;
  const populate = processPopulate(req.query.populate);
  const filter = processFilter(req.query.filter);
  const sort = processSort(req.query.sorting);

  if (req.user.roles.indexOf('admin') === -1) {
    filter.user = req.user._id;
  }

  const options = {
    filters: {
      field: req.query.field || '',
      mandatory: {
        contains: filter
      }
    },
    sort: sort,
    start: (page - 1) * count,
    count: count
  };

  Favorite.find()
    .populate(populate)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, favorites) {
      if (err) {
        return res.status(422).send({
          message: getErrorMessage(err)
        });
      } else {
        return res.status(200).json(favorites);
      }
    });
};

/**
 * Favorite middleware
 */
exports.favoriteByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Favorite is invalid'
    });
  }

  Favorite.findById(id)
    .populate({ path: 'modifiedBy', select: ['displayName'] })
    .populate({ path: 'user', select: ['displayName'] })
    .populate({ path: 'user', select: ['name'] })
    .populate({ path: 'product', select: ['name'] })
    .exec(function (err, favorite) {
      if (err) {
        return next(err);
      } else if (!favorite) {
        return res.status(404).send({
          message: 'No favorite with that identifier has been found'
        });
      }
      req.favorite = favorite;
      next();
    });
};

exports.findOne = async (req, res) => {
  const filter = processFilter(req.query.filter);
  const populate = processPopulate(req.query.populate);

  try {
    const favorite = await Favorite.findOne(filter).lean().populate(populate).exec();
    return res.status(200).json(favorite);
  } catch (e) {
    return res.status(404).send({
      message: getErrorMessage(e)
    });
  }
};

/**
 * Favorite findAll
 */
exports.findAll = function (req, res) {
  const filter = processFilter(req.query.sort);
  const sort = processSort(req.query.filter);

  if (req.user.roles.indexOf('admin') === -1) {
    filter.user = req.user._id;
  }

  Favorite.aggregate()
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
            name: 1
          }
        }
      ],
      as: 'user'
    })
    .unwind({ path: '$user', preserveNullAndEmptyArrays: true })
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
    .match(filter)
    .sort(sort)
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

