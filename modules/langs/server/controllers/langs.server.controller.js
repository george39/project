'use strict';

/**
 * Module dependencies
 */
var path = require('path');
var mongoose = require('mongoose');
var Lang = mongoose.model('Lang');
var errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));
var fs = require('fs');

/**
 * Create an Lang
 */
exports.create = function (req, res) {
  var lang = new Lang(req.body);
  lang.user = req.user;
  lang.shop = req.user.shop;

  lang.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(lang);
    }
  });
};

/**
 * Show the current Lang
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var lang = req.lang ? req.lang.toJSON() : {};

  // Add a custom field to the Lang, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Lang model.
  lang.isCurrentUserOwner = !!(
    req.user &&
    lang.user &&
    lang.user._id.toString() === req.user._id.toString()
  );

  res.json(lang);
};

/**
 * Update an Lang
 */
exports.update = function (req, res) {
  if (req.body.dataFileLang) {
    var arrayOrderUno = Object.keys(req.body.dataFileLang).sort();
    var objectFinal = {};
    for (var i = 0; i < arrayOrderUno.length; i++) {
      objectFinal[arrayOrderUno[i]] = {};
      var arrayOrderDos = Object.keys(req.body.dataFileLang[arrayOrderUno[i]]).sort();
      for (var j = 0; j < arrayOrderDos.length; j++) {
        objectFinal[arrayOrderUno[i]][arrayOrderDos[j]] =
          req.body.dataFileLang[arrayOrderUno[i]][arrayOrderDos[j]];
      }
    }
    fs.writeFile('./l10n/' + req.body.fileName, JSON.stringify(objectFinal, null, 2), function (
      err
    ) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      res.json('OKA');
    });
  } else {
    var lang = req.lang;
    lang.name = req.body.name;
    lang.managerFile_id = req.body.managerFile_id;
    lang.isoCode = req.body.isoCode;
    lang.languageCode = req.body.languageCode;
    lang.locale = req.body.locale;
    lang.fileName = req.body.fileName;
    lang.dateFormatLite = req.body.dateFormatLite;
    lang.dateFormatFull = req.body.dateFormatFull;
    lang.status = req.body.status;
    lang.modifiedBy = req.user._id;
    lang.modified = Date();
    lang.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(lang);
      }
    });
  }
};

/**
 * Delete an Lang
 */
exports.delete = function (req, res) {
  var lang = req.lang;

  lang.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(lang);
    }
  });
};

/**
 * List of Langs
 */
exports.list = function (req, res) {
  var count = req.query.count || 100;
  var page = req.query.page || 1;
  var sort = req.query.sorting || { modified: 'desc' };
  var populate = req.query.populate || [];
  var filter = req.query.filter || {};

  var processFilter = new Lang().processFilter(filter);
  var processPopulate = new Lang().processPopulate(populate);
  var processSort = new Lang().processSort(sort);

  if (req.user.roles.indexOf('admin') === -1) {
    processFilter.shop = req.user.shop;
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

  Lang.find()
    .populate(processPopulate.path, processPopulate.select)
    .field(options)
    .keyword(options)
    .filter(options)
    .order(options)
    .page(options, function (err, langs) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(langs);
      }
    });
};

/**
 * List of Langs
 */
exports.getFileLang = async function (req, res) {
  var fileName = await mongoose.model('Lang').findOne({ _id: req.query.langId }).exec();
  var managerTranslates = JSON.parse(fs.readFileSync('./l10n/' + fileName.fileName));

  // var arrayFinal = [];

  // Object.entries(managerTranslates).forEach((element) => {
  //   console.log(element);
  // });

  var dataResult = {
    _id: fileName._id,
    created: fileName.created,
    dateFormatFull: fileName.dateFormatFull,
    dateFormatLite: fileName.dateFormatLite,
    fileName: fileName.fileName,
    isoCode: fileName.isoCode,
    languageCode: fileName.languageCode,
    locale: fileName.locale,
    managerFile_id: fileName.managerFile_id,
    modified: fileName.modified,
    modifiedBy: fileName.modifiedBy,
    name: fileName.name,
    status: fileName.status,
    user: fileName.user,
    results: managerTranslates
  };
  res.json(dataResult);
};

/**
 * Lang middleware
 */
exports.langByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Lang is invalid'
    });
  }

  Lang.findById(id)
    .populate('modifiedBy', 'displayName')
    .populate('user shop', 'displayName name')
    .populate({ path: 'managerFile_id', select: ['originalname', 'path'] })
    .exec(function (err, lang) {
      if (err) {
        return next(err);
      } else if (!lang) {
        return res.status(404).send({
          message: 'No lang with that identifier has been found'
        });
      }
      req.lang = lang;
      next();
    });
};
