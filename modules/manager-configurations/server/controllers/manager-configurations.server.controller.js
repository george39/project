'use strict';

/**
 * Module dependencies
 */
const path = require('path');
const mongoose = require('mongoose');
const ManagerConfiguration = mongoose.model('ManagerConfiguration');
const ManagerFile = mongoose.model('ManagerFile');
const errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Create an Manager Configuration
 */
exports.create = function (req, res) {
  const managerConfiguration = new ManagerConfiguration(req.body);
  managerConfiguration.user = req.user._id;
  managerConfiguration.shop = req.user.shop;

  managerConfiguration.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(managerConfiguration);
    }
  });
};

/**
 * Show the current Manager Configuration
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  const managerConfiguration = req.managerConfiguration ? req.managerConfiguration.toJSON() : {};

  // Add a custom field to the ManagerConfiguration, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the ManagerConfiguration model.
  managerConfiguration.isCurrentUserOwner = !!(
    req.user &&
    managerConfiguration.user &&
    managerConfiguration.user._id.toString() === req.user._id.toString()
  );

  return res.status(200).json(managerConfiguration);
};

/**
 * Update an Manager Configuration
 */
exports.update = function (req, res) {
  const managerConfiguration = req.managerConfiguration;

  managerConfiguration.name = req.body.name;
  managerConfiguration.friendly = req.body.friendly;
  managerConfiguration.value = req.body.value;
  managerConfiguration.isPublic = req.body.isPublic;
  managerConfiguration.managerFiles = req.body.managerFiles;
  managerConfiguration.status = req.body.status;
  managerConfiguration.modifiedBy = req.user._id;
  managerConfiguration.modified = Date();

  managerConfiguration.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.status(200).json(managerConfiguration);
    }
  });
};

/**
 * Delete an Manager Configuration
 */
exports.delete = async function (req, res) {
  const managerConfiguration = req.managerConfiguration;

  try {
    await managerConfiguration.remove();

    const data = managerConfiguration.managerFiles.map((file) => {
      return { _id: file._id, path: file.path };
    });

    await new ManagerFile().promiseRemoveAllFiles(data);
    return res.status(200).json(managerConfiguration);
  } catch (e) {
    return res.status(422).send({
      message: errorHandler.getErrorMessage(e)
    });
  }
};

/**
 * List of Manager Configurations
 */
exports.list = function (req, res) {
  const count = req.query.count || 100;
  const page = req.query.page || 1;
  const sort = req.query.sorting || { modified: 'desc' };
  const populate = req.query.populate || [];
  const filter = req.query.filter || {};

  const processFilter = new ManagerConfiguration().processFilter(filter);
  const processPopulate = new ManagerConfiguration().processPopulate(populate);
  const processSort = new ManagerConfiguration().processSort(sort);

  if (req.user && req.user.roles.indexOf('admin') === -1) {
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

  ManagerConfiguration.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, managerConfigurations) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        return res.status(200).json(managerConfigurations);
      }
    });
};

/**
 * ManagerConfiguration middleware
 */
exports.managerConfigurationByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ManagerConfiguration is invalid'
    });
  }

  ManagerConfiguration.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user', 'displayName')
    .populate('managerFiles', '')
    .exec(function (err, managerConfiguration) {
      if (err) {
        return next(err);
      } else if (!managerConfiguration) {
        return res.status(404).send({
          message: 'No managerConfiguration with that identifier has been found'
        });
      }
      req.managerConfiguration = managerConfiguration;
      next();
    });
};
