'use strict';

/**
 * Module dependencies
 */
const path = require('path');
const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const User = mongoose.model('User');
const errorHandler = require(path.resolve(
  './modules/core/server/controllers/errors.server.controller'
));

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.status(200).json(req.model);
};

exports.create = async function (req, res) {
  const user = new User(req.body);
  user.username = user.email;
  user.displayName = `${user.firstName} ${user.lastName}`;
  user.provider = 'local';
  const userGroup = await Group.findOne({ _id: req.body.group });
  user.shop = req.user.shop;
  user.group = userGroup._id;
  user.roles = [userGroup.name];

  await user.save(function (err, resp) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: errorHandler.getErrorMessage(err) });
    }

    return res.status(200).json({ message: 'Usuario creado' });
  });
};

/**
 * Update a User
 */
exports.update = async function (req, res) {
  const user = req.model;

  // For security purposes only merge these parameters
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.addresses = req.body.addresses;
  user.listDiscount_id = req.body.listDiscount_id;
  user.phone = req.body.phone;
  user.DNI = req.body.DNI;
  user.description = req.body.description;
  const userGroup = await Group.findOne({ _id: req.body.group });
  user.group = req.body.group;
  user.roles = [userGroup.name];

  if (req.user.roles.includes('admin')) {
    user.shop = req.body.shop;
  }

  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.status(200).json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  req.model.remove(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.status(200).json(req.model);
  });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  var filter = {};

  if (!req.user.roles.includes('admin')) {
    filter.shop = req.user.shop;
    filter._id = {
      $ne: req.user._id
    };
  }

  User.find(filter, '-salt -password -providerData')
    .sort('-created')
    .populate('user', 'displayName')
    .populate('group')
    .populate('shop')
    .exec(function (err, users) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      res.status(200).json(users);
    });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password -providerData')
    .populate('group')
    .populate('shop')
    .populate('listDiscount_id')
    .exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return next(new Error('Failed to load user ' + id));
      }

      req.model = user;
      next();
    });
};
