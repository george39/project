'use strict';

/**
 * Module dependencies
 */
const path = require('path');
const { unlinkSync } = require('fs');
const mongoose = require('mongoose');
const ManagerFile = mongoose.model('ManagerFile');
const errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));
const sharp = require('sharp');

/**
 * Create an Manager File
 */
exports.create = async function (req, res) {
  let managerFile = new ManagerFile(req.body);
  managerFile.user = req.user._id;
  managerFile.shop = req.user.shop;

  await new ManagerFile()
    .promiseCreateFile(req, res)
    .then(function (resCreateFile) {})
    .catch(function (errCreateFile) {
      if (errCreateFile) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errCreateFile)
        });
      }
    });

  managerFile = new ManagerFile(req.file);
  managerFile.path = '/' + req.file.path;
  managerFile.user = req.user._id;
  managerFile.shop = req.user.shop;

  const oldPath = managerFile.path;
  const newFileName = `${managerFile.filename}.webp`;
  const newDestination = `${path.resolve(managerFile.destination)}/${newFileName}`;
  await sharp(path.resolve(`.${managerFile.path}`))
    .toFile(newDestination)
    .then((res) => {
      managerFile.size = res.size;
      managerFile.filename = newFileName;
      managerFile.mimetype = 'image/webp';
      const newPath = managerFile.destination.substr(1, managerFile.destination.length);
      managerFile.path = newPath + newFileName;
    })
    .then(() => unlinkSync(`.${oldPath}`))
    .catch((err) => {
      console.error(err);
    });

  managerFile.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.status(200).json(managerFile);
    }
  });
};

/**
 * Show the current Manager File
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  const managerFile = req.managerFile ? req.managerFile.toJSON() : {};

  // Add a custom field to the ManagerFile, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the ManagerFile model.
  managerFile.isCurrentUserOwner = !!(
    req.user &&
    managerFile.user &&
    managerFile.user._id.toString() === req.user._id.toString()
  );

  return res.json(managerFile);
};

/**
 * Update an Manager File
 */
exports.update = async function (req, res) {
  await new ManagerFile()
    .promiseRemoveFile(req.managerFile.path)
    .then(function (resRemoveFile) {})
    .catch(function (errRemoveFile) {
      if (errRemoveFile) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errRemoveFile)
        });
      }
    });

  await new ManagerFile()
    .promiseCreateFile(req, res)
    .then(function (resCreateFile) {})
    .catch(function (errCreateFile) {
      if (errCreateFile) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errCreateFile)
        });
      }
    });

  const managerFile = req.managerFile;

  managerFile.fieldname = req.file.fieldname;
  managerFile.originalname = req.file.originalname;
  managerFile.encoding = req.file.encoding;
  managerFile.mimetype = req.file.mimetype;
  managerFile.destination = req.file.destination;
  managerFile.filename = req.file.filename;
  managerFile.path = '/' + req.file.path;
  managerFile.size = req.file.size;
  managerFile.shop = req.file.shop;
  managerFile.modifiedBy = req.user._id;
  managerFile.modified = Date();

  const oldPath = managerFile.path;
  const newFileName = `${managerFile.filename}.webp`;
  const newDestination = `${path.resolve(managerFile.destination)}/${newFileName}`;
  await sharp(path.resolve(`.${managerFile.path}`))
    .toFile(newDestination)
    .then((res) => {
      managerFile.size = res.size;
      managerFile.filename = newFileName;
      managerFile.mimetype = 'image/webp';
      const newPath = managerFile.destination.substr(1, managerFile.destination.length);
      managerFile.path = newPath + newFileName;
    })
    .then(() => unlinkSync(`.${oldPath}`))
    .catch((err) => {
      console.error(err);
    });

  managerFile.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.status(200).json(managerFile);
    }
  });
};

/**
 * Delete an Manager File
 */
exports.delete = async function (req, res) {
  var managerFile = req.managerFile;

  await new ManagerFile()
    .promiseRemoveFile(req.managerFile.path)
    .then(function (resRemoveFile) {})
    .catch(function (errRemoveFile) {
      if (errRemoveFile) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errRemoveFile)
        });
      }
    });

  managerFile.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      return res.json(managerFile);
    }
  });
};

/**
 * Delete an Manager File
 */
exports.removeAllFiles = async function (req, res) {
  var data = [];

  if (!req.query.data) {
    return res.json({ error: false, results: true, data: 'Sin datos para eliminar' });
  } else if (typeof req.query.data === 'object') {
    for (var index = 0; index < req.query.data.length; index++) {
      data.push(JSON.parse(req.query.data[index]));
    }
  } else {
    data.push(JSON.parse(req.query.data));
  }

  await new ManagerFile()
    .promiseRemoveAllFiles(data)
    .then(function () {
      return res.json({ error: false, results: true, data: 'Deleted OK' });
    })
    .catch(function (errRemoveFile) {
      if (errRemoveFile) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(errRemoveFile)
        });
      }
    });
};

/**
 * List of Manager Files
 */
exports.list = function (req, res) {
  const count = req.query.count || 100;
  const page = req.query.page || 1;
  const sort = req.query.sorting || { modified: 'desc' };
  const populate = req.query.populate || [];
  const filter = req.query.filter || {};

  const processFilter = new ManagerFile().processFilter(filter);
  const processPopulate = new ManagerFile().processPopulate(populate);
  const processSort = new ManagerFile().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.user = req.user._id;
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

  ManagerFile.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, managerFiles) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(managerFiles);
      }
    });
};

/**
 * ManagerFile middleware
 */
exports.managerFileByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ManagerFile is invalid'
    });
  }

  ManagerFile.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user shop', 'displayName name')
    .exec(function (err, managerFile) {
      if (err) {
        return next(err);
      } else if (!managerFile) {
        return res.status(404).send({
          message: 'No managerFile with that identifier has been found'
        });
      }
      req.managerFile = managerFile;
      next();
    });
};
