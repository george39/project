'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var path = require('path');
var config = require(path.resolve('./config/config'));
var chalk = require('chalk');

// Using the memory backend
var acl = require('acl');
acl = new acl(new acl.mongodbBackend(mongoose.connection.db, 'acl_', true));

/**
 * Group Schema
 */
var GroupSchema = new Schema({
  name: {
    type: String
  },
  option: {
    type: Object
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

/**
 * obtiene todos los modulos
 * disponibles del sistema
 * @return {object} Arreglo json
 */
GroupSchema.methods.getModules = function () {
  const path = require('path');
  const express = require('express');
  var router = express.Router();
  var newItem = require(path.resolve('./config/lib/express'));
  var object = {};
  var item;

  newItem.initModulesServerRoutes(router);

  var methodAction;
  var moduleName;
  for (item in router.stack) {
    if (!router.stack.hasOwnProperty(item)) {
      continue;
    }

    methodAction = router.stack[item].route.path;
    moduleName = methodAction.split('/');

    if (methodAction === undefined || methodAction === '') {
      continue;
    }

    if (moduleName[1] !== 'api') {
      continue;
    }

    if (!moduleName[2] || moduleName[2] === '' || moduleName[2] === '*') {
      continue;
    }

    for (var method1 in router.stack[item].route.methods) {
      if (method1 === '_all') {
        continue;
      }

      if (!object.hasOwnProperty(moduleName[2])) {
        object[moduleName[2]] = {};
      }

      if (!object[moduleName[2]].hasOwnProperty(methodAction)) {
        object[moduleName[2]][methodAction] = {};
      }

      object[moduleName[2]][methodAction][method1] = false;
    }
  }

  return object;
};

GroupSchema.methods.processObjectACL = function (name, options) {
  var arrayFinal = [];
  var objectOptions = {
    roles: name,
    allows: []
  };

  for (const key in options) {
    if (!options.hasOwnProperty(key)) {
      continue;
    }
    for (const key2 in options[key]) {
      if (!options[key].hasOwnProperty(key2)) {
        continue;
      }
      arrayFinal = [];
      for (const key3 in options[key][key2]) {
        if (!options[key][key2].hasOwnProperty(key3)) {
          continue;
        }
        if (options[key][key2][key3] === true) {
          arrayFinal.push(key3);
        }
      }
      if (!arrayFinal.length) {
        continue;
      }
      objectOptions.allows.push({
        resources: key2,
        permissions: arrayFinal
      });
    }
  }
  return objectOptions;
};

GroupSchema.methods.processObjectGroup = function (options) {
  var objectOptions = {};

  for (const key in options) {
    if (!options.hasOwnProperty(key)) {
      continue;
    }
    for (const key2 in options[key]) {
      if (!options[key].hasOwnProperty(key2)) {
        continue;
      }
      for (const key3 in options[key][key2]) {
        if (!options[key][key2].hasOwnProperty(key3)) {
          continue;
        }
        if (options[key][key2][key3] === true) {
          if (!objectOptions[key]) {
            objectOptions[key] = options[key];
          }
          if (!objectOptions[key][key2]) {
            objectOptions[key][key2] = options[key][key2];
          }
          objectOptions[key][key2][key3] = true;
        }
      }
    }
  }
  return objectOptions;
};

GroupSchema.methods.promiseRemoveRole = function (role) {
  return new Promise(function (resolve, reject) {
    acl.removeRole(role, function (err) {
      if (err) {
        return reject(err);
      }
      return resolve(role);
    });
  });
};

GroupSchema.methods.promiseAllow = function (permissionsArray) {
  return new Promise(function (resolve, reject) {
    acl.allow(permissionsArray, function (err) {
      if (err) {
        return reject(err);
      }
      return resolve(permissionsArray);
    });
  });
};

GroupSchema.methods.promiseWhatResources = function (role) {
  return new Promise(function (resolve, reject) {
    acl.whatResources(role, function (err, resources) {
      if (err) {
        return reject(err);
      }
      return resolve(resources);
    });
  });
};

// methods
GroupSchema.methods.processFilter = function (params) {
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

  for (var field in GroupSchema.paths) {
    if (!GroupSchema.paths.hasOwnProperty(field)) {
      continue;
    }

    if (params[field] === '' || params[field] === null) {
      delete params[field];
      continue;
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

    if (GroupSchema.paths[field].instance === 'Number') {
      params[field] = parseFloat(params[field], 10);
    }
  }
  return params;
};

GroupSchema.methods.processPopulate = function (params) {
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

GroupSchema.methods.processSort = function (params) {
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

GroupSchema.statics.seed = seed;

mongoose.model('Group', GroupSchema);

/**
 * Seeds the User collection with document (Group)
 * and provided options.
 */
function seed(doc, options) {
  var Group = mongoose.model('Group');

  return new Promise(function (resolve, reject) {
    skipDocument()
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        Group.findOne({
          name: doc.name
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

          // Remove Group (overwrite)

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
            message: chalk.yellow('Database Seeding: Group\t' + doc.name + ' skipped')
          });
        }

        var group = new Group(doc);

        group.save(function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            message: 'Database Seeding: Group\t' + group.name + ' added'
          });
        });
      });
    }
  });
}
