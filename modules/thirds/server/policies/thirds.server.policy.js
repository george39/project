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
 * Invoke Thirds Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([
    {
      roles: ['admin'],
      allows: [
        {
          resources: '/api/thirds',
          permissions: '*'
        },
        {
          resources: '/api/thirds/:thirdId',
          permissions: '*'
        }
      ]
    }
  ]);
};

/**
 * Check If Thirds Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an Third is being processed and the current user created it then allow any manipulation
  if (
    req.third &&
    req.user &&
    req.third.user &&
    req.third.user.id === req.user.id
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
