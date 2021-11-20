'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const path = require('path');
const config = require(path.resolve('./config/config'));
const chalk = require('chalk');
const fs = require('fs');
const multer = require('multer');
const errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));
const { asyncForEach } = require(path.resolve('./helpers/global-helpers'));

/**
 * Manager File Schema
 */
const ManagerFileSchema = new Schema({
  fieldname: {
    type: String
  },
  originalname: {
    type: String
  },
  encoding: {
    type: String
  },
  mimetype: {
    type: String
  },
  destination: {
    type: String
  },
  filename: {
    type: String
  },
  path: {
    type: String
  },
  size: {
    type: String
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
ManagerFileSchema.methods.processFilter = function (params) {
  if (!params || typeof params == 'undefined') {
    return {};
  }

  if (typeof params == 'string') {
    params = JSON.parse(params);
  }

  if (typeof params != 'object') {
    return {};
  }

  if (Object.keys(params).length === 0) {
    return {};
  }

  var moment = require('moment');
  var date1;
  var date2;

  for (var field in ManagerFileSchema.paths) {
    if (ManagerFileSchema.paths.hasOwnProperty(field)) {
      continue;
    }

    if (params[field] === '' || params[field] === null) {
      delete params[field];
      continue;
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

    if (ManagerFileSchema.paths[field].instance === 'Number') {
      params[field] = parseFloat(params[field], 10);
    }
  }
  return params;
};

ManagerFileSchema.methods.processPopulate = function (params) {
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

ManagerFileSchema.methods.processSort = function (params) {
  if (!params || typeof params == 'undefined') {
    return {
      modified: -1
    };
  }

  if (typeof params == 'string') {
    params = JSON.parse(params);
  }

  if (typeof params != 'object') {
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

ManagerFileSchema.methods.promiseRemoveFile = function (fileUrl) {
  return new Promise(function (resolve, reject) {
    fs.unlink(resolve('.' + fileUrl), function (unlinkError) {
      if (unlinkError) {
        // If file didn't exist, no need to reject promise
        if (unlinkError.code === 'ENOENT') {
          console.log('Removing profile image failed because file did not exist.');
          return resolve(unlinkError);
        }
        console.error(unlinkError);
        reject({
          message: 'Error occurred while deleting old profile picture'
        });
      } else {
        return resolve(fileUrl);
      }
    });
  });
};

ManagerFileSchema.methods.promiseRemoveAllFiles = async function (files) {
  const _this = this;
  await asyncForEach(files, async function (value) {
    await _this.promiseRemoveFile(value.path);
    await mongoose.model('ManagerFile').deleteOne({ _id: value._id }).exec();
  });
  return;
};

ManagerFileSchema.methods.promiseCreateFile = function (req, res) {
  return new Promise(function (resolve, reject) {
    const multerConfig = {
      dest: req.body.dest || './modules/manager-files/client/files/',
      limits: req.body.limits || { fileSize: 4048576 },
      fileFilter:
        req.body.fileFilter || require(path.resolve('./config/lib/multer')).imageFileFilter
    };

    const fieldName = req.body.fieldName || 'newProfilePicture';
    const upload = multer(multerConfig).single(fieldName);

    if (req.user) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve(req.file);
        }
      });
    } else {
      return reject({ response: false, error: true, data: 'Usuario no esta logeado' });
    }
  });
};

ManagerFileSchema.statics.seed = seed;

module.exports = mongoose.model('ManagerFile', ManagerFileSchema);

/**
 * Seeds the User collection with document (ManagerFile)
 * and provided options.
 */
function seed(doc, options) {
  var ManagerFile = mongoose.model('ManagerFile');

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
        ManagerFile.findOne({
          filename: doc.filename
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

          // Remove ManagerFile (overwrite)

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
            message: chalk.yellow('Database Seeding: ManagerFile\t' + doc.filename + ' skipped')
          });
        }

        var managerFile = new ManagerFile(doc);

        managerFile.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: ManagerFile\t' + managerFile.filename + ' added'
          });
        });
      });
    }
  });
}
