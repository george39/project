'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');
var mongoose = require('mongoose');

// Using the memory backend
// acl = new acl(new acl.memoryBackend());
acl = new acl(new acl.mongodbBackend(mongoose.connection.db, 'acl_', true));

/**
 * Invoke Shops Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([
    {
      roles: ['admin'],
      allows: [
        {
          resources: '/api/shops',
          permissions: '*'
        },
        {
          resources: '/api/shops/:shopId',
          permissions: '*'
        }
      ]
    }
  ]);
};

/**
 * Check If Shops Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Shop is being processed and the current user created it then allow any manipulation
  if (
    req.shop &&
    req.user &&
    req.shop.user &&
    req.shop.user.id === req.user.id
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
