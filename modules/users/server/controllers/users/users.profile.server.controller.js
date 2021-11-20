'use strict';

/**
 * Module dependencies
 */
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));
const mongoose = require('mongoose');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const amazonS3URI = require('amazon-s3-uri');
const config = require(path.resolve('./config/config'));
const User = mongoose.model('User');
const validator = require('validator');
const Order = mongoose.model('Order');

var whitelistedFields = ['firstName', 'lastName', 'email', 'username', 'addresses'];

var useS3Storage = config.uploads.storage === 's3' && config.aws.s3;
var s3;

if (useS3Storage) {
  aws.config.update({
    accessKeyId: config.aws.s3.accessKeyId,
    secretAccessKey: config.aws.s3.secretAccessKey
  });

  s3 = new aws.S3();
}

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  if (user) {
    // Update whitelisted fields only
    user = _.extend(user, _.pick(req.body, whitelistedFields));

    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;
    user.description = req.body.description;
    user.username = req.body.username;
    user.phone = req.body.phone;
    user.DNI = req.body.DNI;

    user.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
};

exports.workWithUs = (req, res) => {
  console.log(req.body);
  console.log('------------');
  console.log(req.file);
  console.log('------------');
  console.log(req.files);
};

exports.updatePrivacyOptions = async (req, res) => {
  const userId = req.user._id;

  try {
    await User.update({ _id: userId }, { $set: { privacy: req.body } });
    return res.status(200).json({ message: 'Actualizado' });
  } catch (error) {
    return res
      .status(422)
      .json({ message: 'Ocurrió un error al actualizar las opciones de privacidad' });
  }
};

exports.getPrivacyOptions = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findOne({ _id: userId }).lean().exec();
    return res.status(200).json(user.privacy || {});
  } catch (e) {
    return res
      .status(422)
      .json({ message: 'Ocurrió un error al obtener las opciones de privacidad' });
  }
};

exports.getUsersThatUseThisProduct = async (req, res) => {
  let user = null;

  if (req.user) {
    user = req.user._id;
  }

  const aggregate = [
    {
      $match: {
        'products.product_id': mongoose.Types.ObjectId(req.params.productId),
        user_id: {
          $ne: user !== null ? mongoose.Types.ObjectId(user) : user
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $match: {
        'user.privacy.canOtherUsersViewMyProducts': true
      }
    },
    {
      $unwind: {
        path: '$user'
      }
    },
    {
      $project: {
        'user.displayName': 1,
        'user.firstName': 1,
        'user.shop': 1,
        'user.profileImageURL': 1,
        'user.followers': 1,
        'user._id': 1
      }
    },
    {
      $sort: {
        'user.followers': -1
      }
    },
    {
      $limit: 5
    }
  ];

  try {
    const users = await Order.aggregate(aggregate).exec();

    if (users) {
      const response = users.map((user) => user.user);
      return res.status(200).json(response);
    }

    return res.status(200).json([]);
  } catch (e) {
    return res.status(422).json({ message: 'Ha ocurrido un error al obtener usuarios' });
  }
};

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var existingImageUrl;
  var multerConfig;

  if (useS3Storage) {
    multerConfig = {
      storage: multerS3({
        s3: s3,
        bucket: config.aws.s3.bucket,
        acl: 'public-read'
      })
    };
  } else {
    multerConfig = config.uploads.profile.image;
  }

  // Filtering to upload only images
  multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;

  var upload = multer(multerConfig).single('newProfilePicture');

  if (user) {
    existingImageUrl = user.profileImageURL;
    uploadImage()
      .then(updateUser)
      .then(deleteOldImage)
      .then(login)
      .then(function () {
        res.json(user);
      })
      .catch(function (err) {
        res.status(422).send(err);
      });
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }

  function uploadImage() {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  function updateUser() {
    return new Promise(function (resolve, reject) {
      user.profileImageURL =
        config.uploads.storage === 's3' && config.aws.s3 ? req.file.location : '/' + req.file.path;
      user.save(function (err, theuser) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  function deleteOldImage() {
    return new Promise(function (resolve, reject) {
      if (existingImageUrl !== User.schema.path('profileImageURL').defaultValue) {
        if (useS3Storage) {
          try {
            var { region, bucket, key } = amazonS3URI(existingImageUrl);
            var params = {
              Bucket: config.aws.s3.bucket,
              Key: key
            };

            s3.deleteObject(params, function (err) {
              if (err) {
                console.log('Error occurred while deleting old profile picture.');
                console.log('Check if you have sufficient permissions : ' + err);
              }

              resolve();
            });
          } catch (err) {
            console.warn(`${existingImageUrl} is not a valid S3 uri`);

            return resolve();
          }
        } else {
          fs.unlink(path.resolve('.' + existingImageUrl), function (unlinkError) {
            if (unlinkError) {
              // If file didn't exist, no need to reject promise
              if (unlinkError.code === 'ENOENT') {
                console.log('Removing profile image failed because file did not exist.');
                return resolve();
              }

              reject({
                message: 'Error occurred while deleting old profile picture'
              });
            } else {
              resolve();
            }
          });
        }
      } else {
        resolve();
      }
    });
  }

  function login() {
    return new Promise(function (resolve, reject) {
      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          resolve();
        }
      });
    });
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  let safeUserObject = null;
  if (req.user) {
    safeUserObject = {
      displayName: validator.escape(req.user.displayName),
      provider: validator.escape(req.user.provider),
      username: validator.escape(req.user.username),
      created: req.user.created.toString(),
      roles: req.user.roles,
      profileImageURL: req.user.profileImageURL,
      email: validator.escape(req.user.email),
      lastName: validator.escape(req.user.lastName),
      firstName: validator.escape(req.user.firstName),
      addresses: req.user.addresses,
      additionalProvidersData: req.user.additionalProvidersData
    };
  }

  res.json(safeUserObject || null);
};
