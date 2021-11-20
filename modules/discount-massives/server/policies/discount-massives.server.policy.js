'use strict';

/**
 * Module dependencies
 */
let acl = require('acl');
const mongoose = require('mongoose');

// Using the memory backend
// acl = new acl(new acl.memoryBackend());
acl = new acl(new acl.mongodbBackend(mongoose.connection.db, 'acl_', true));

/**
 * Invoke Discount massives Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([
    {
      roles: ['admin'],
      allows: [
        {
          resources: '/api/discountMassives',
          permissions: '*'
        },
        {
          resources: '/api/discountMassives/:discountMassiveId',
          permissions: '*'
        }
      ]
    }
  ]);
};

/**
 * Check If Discount Massives Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Discount Massive is being processed and the current user created it then allow any manipulation
  if (
    req.discountMassive &&
    req.user &&
    req.discountMassive.user &&
    req.discountMassive.user.id === req.user.id
  ) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
