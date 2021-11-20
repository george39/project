'use strict';

/**
 * Module dependencies
 */
const path = require('path');
const mongoose = require('mongoose');
const Notification = mongoose.model('Notification');
const errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Notification
 */
exports.create = function (req, res) {
  const notification = new Notification(req.body);
  notification.user = req.user._id;

  notification.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.status(200).json(notification);
    }
  });
};

/**
 * Show the current Notification
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  const notification = req.notification ? req.notification.toJSON() : {};

  // Add a custom field to the Notification, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Notification model.
  notification.isCurrentUserOwner = !!(
    req.user &&
    notification.user &&
    notification.user._id.toString() === req.user._id.toString()
  );

  return res.status(200).json(notification);
};

/**
 * Update an Notification
 */
exports.update = function (req, res) {
  const notification = req.notification;

  notification.name = req.body.name;
  notification.description = req.body.description;
  notification.redirectTo = req.body.redirectTo;
  notification.read = req.body.read;
  notification.icon = req.body.icon;
  notification.modifiedBy = req.user._id;
  notification.createdBy = req.user._id;
  notification.modified = Date();

  notification.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.status(200).json(notification);
    }
  });
};

exports.readNotifications = async (req, res) => {
  const { notifications } = req.body;

  try {
    await Notification.updateMany({ _id: { $in: notifications } }, { $set: { read: true } });
  } catch (e) {
    return res.status(422).json({ message: 'No se pudieron leer las notificaciones' });
  }

  return res.status(200).json({ message: 'Notificaciones leídas' });
};

/**
 * Delete an Notification
 */
exports.delete = function (req, res) {
  const notification = req.notification;

  notification.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.status(200).json(notification);
    }
  });
};

/**
 * List of Notifications
 */
exports.list = function (req, res) {
  const count = req.query.count || 100;
  const page = req.query.page || 1;
  const sort = req.query.sorting || { modified: 'desc' };
  const populate = req.query.populate || [];
  const filter = req.query.filter || {};

  const processFilter = new Notification().processFilter(filter);
  const processPopulate = new Notification().processPopulate(populate);
  const processSort = new Notification().processSort(sort);

  processFilter.user = req.user._id;

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

  Notification.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, notifications) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        return res.status(200).json(notifications);
      }
    });
};

/**
 * Notification middleware
 */
exports.notificationByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Notification is invalid'
    });
  }

  Notification.findById(id)
    .populate({ path: 'modifiedBy', select: ['displayName'] })
    .populate({ path: 'user', select: ['displayName'] })
    .exec(function (err, notification) {
      if (err) {
        return next(err);
      } else if (!notification) {
        return res.status(404).send({
          message: 'No notification with that identifier has been found'
        });
      }

      req.notification = notification;
      next();
    });
};

/**
 * Notification findAll
 */
exports.findAll = function (req, res) {
  var sort = req.query.sort || { modified: -1 };
  var filter = req.query.filter || {};

  var processFilter = new Notification().processFilter(filter);
  var processSort = new Notification().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.user = req.user._id;
  }

  Notification.aggregate()
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
