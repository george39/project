'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var acl = require('acl');
var mongoose = require('mongoose');
var Group = mongoose.model('Group');
var errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

// Using the memory backend
acl = new acl(new acl.mongodbBackend(mongoose.connection.db, 'acl_', true));

/**
 * Create an Group
 */
exports.create = async function (req, res) {
  const group = new Group(req.body);
  group.user = req.user._id;
  group.shop = req.user.shop;

  await new Group()
    .promiseRemoveRole(group.name)
    .then(function (resRemoveRole) {})
    .catch(function (errRemoveRole) {
      if (errRemoveRole) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errRemoveRole)
        });
      }
    });

  const objectOptions = new Group().processObjectACL(group.name, group.option);
  await new Group()
    .promiseAllow([objectOptions])
    .then(function (rstAllowRole) {})
    .catch(function (errAllowRole) {
      if (errAllowRole) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errAllowRole)
        });
      }
    });

  await new Group()
    .promiseWhatResources(group.name)
    .then(function (rstWhatResources) {})
    .catch(function (errWhatResources) {
      if (errWhatResources) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errWhatResources)
        });
      }
    });

  group.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.status(200).json(group);
    }
  });
};

/**
 * Show the current Group
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var group = req.group ? req.group.toJSON() : {};

  // Add a custom field to the Group, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Group model.
  group.isCurrentUserOwner = !!(
    req.user &&
    group.user &&
    group.user._id.toString() === req.user._id.toString()
  );

  return res.json(group);
};

/**
 * Update an Group
 */
exports.update = async function (req, res) {
  var group = req.group;
  var newName = req.body.name;
  var oldName = req.group.name;

  group.name = req.body.name;
  group.option = req.body.option;
  group.modifiedBy = req.user._id;
  group.modified = Date();

  if (newName !== oldName) {
    await new Group()
      .promiseRemoveRole(oldName)
      .then(function (resRemoveRole) {})
      .catch(function (errRemoveRole) {
        if (errRemoveRole) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(errRemoveRole)
          });
        }
      });
  }

  await new Group()
    .promiseRemoveRole(newName)
    .then(function (resRemoveRole) {})
    .catch(function (errRemoveRole) {
      if (errRemoveRole) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errRemoveRole)
        });
      }
    });

  var objectOptions = new Group().processObjectACL(newName, group.option);
  await new Group()
    .promiseAllow([objectOptions])
    .then(function (rstAllowRole) {})
    .catch(function (errAllowRole) {
      if (errAllowRole) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errAllowRole)
        });
      }
    });

  await new Group()
    .promiseWhatResources(group.name)
    .then(function (rstWhatResources) {})
    .catch(function (errWhatResources) {
      if (errWhatResources) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errWhatResources)
        });
      }
    });

  var objectOptionsGroup = new Group().processObjectGroup(group.option);
  group.option = objectOptionsGroup;

  group.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(group);
    }
  });
};

/**
 * Delete an Group
 */
exports.delete = async function (req, res) {
  var group = req.group;

  await new Group()
    .promiseRemoveRole(group.name)
    .then(function (resRemoveRole) {})
    .catch(function (errRemoveRole) {
      if (errRemoveRole) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errRemoveRole)
        });
      }
    });

  group.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(group);
    }
  });
};

/**
 * List of Groups
 */
exports.list = async function (req, res) {
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || {
    modified: 'desc'
  };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Group().processFilter(filter);
  var processPopulate = new Group().processPopulate(populate);
  var processSort = new Group().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    // processFilter.shop = req.user.shop;
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

  Group.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, groups) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(groups);
      }
    });
};

/**
 * Group middleware
 */
exports.groupByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Group is invalid'
    });
  }

  Group.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user', 'displayName')
    .exec(function (err, group) {
      if (err) {
        return next(err);
      } else if (!group) {
        return res.status(404).send({
          message: 'No group with that identifier has been found'
        });
      }
      req.group = group;
      next();
    });
};

/**
 * List groups
 */
exports.listModules = function (req, res) {
  var listModules = new Group().getModules();
  return res.json(listModules);
};
