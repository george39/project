'use strict';

/**
 * Module dependencies
 */
const mongoose = require('mongoose');
const path = require('path');
const config = require(path.resolve('./config/config'));
const Schema = mongoose.Schema;
const crypto = require('crypto');
const validator = require('validator');
const generatePassword = require('generate-password');
const owasp = require('owasp-password-strength-test');
const chalk = require('chalk');

owasp.config(config.shared.owasp);

/**
 * A Validation function for local strategy properties
 */
const validateLocalStrategyProperty = function (property) {
  return (this.provider !== 'local' && !this.updated) || property.length;
};

/**
 * A Validation function for local strategy email
 */
const validateLocalStrategyEmail = function (email) {
  return (
    (this.provider !== 'local' && !this.updated) || validator.isEmail(email, { require_tld: false })
  );
};

const isNumber = function (property) {
  const isNumberRegex = /^\d+$/;
  return isNumberRegex.test(property);
};

/**
 * A Validation function for username
 * - at least 3 characters
 * - only a-z0-9_-.
 * - contain at least one alphanumeric character
 * - not in list of illegal usernames
 * - no consecutive dots: "." ok, ".." nope
 * - not begin or end with "."
 */

const validateUsername = function (username) {
  var usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;
  return (
    this.provider !== 'local' ||
    (username && usernameRegex.test(username) && config.illegalUsernames.indexOf(username) < 0)
  );
};

/**
 * User Schema
 */
const UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your first name']
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
    validate: [validateLocalStrategyProperty, 'Please fill in your last name']
  },
  displayName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    index: {
      unique: true,
      sparse: true // For this to work on a previously indexed field, the index must be dropped & the application restarted.
    },
    lowercase: true,
    trim: true,
    default: '',
    validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    default: '',
    validate: [isNumber, 'El teléfono no puede contener letras']
  },
  DNI: {
    type: String,
    validate: [isNumber, 'EL DNI no puede contener letras']
  },
  listDiscount_id: {
    type: Schema.ObjectId,
    ref: 'DiscountList'
  },
  addresses: [
    {
      address: {
        type: String
      },
      country: {
        type: String
      },
      city: {
        type: String
      },
      postalCode: {
        type: String,
        default: ''
      },
      zone: {
        type: String,
        default: ''
      },
      isDefaultAddress: {
        type: Boolean,
        default: false
      }
    }
  ],
  username: {
    type: String,
    unique: 'Username already exists',
    required: 'Please fill in a username',
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    default: ''
  },
  salt: {
    type: String
  },
  profileImageURL: {
    type: String,
    default: '/modules/users/client/img/profile/default.png'
  },
  provider: {
    type: String,
    required: 'Provider is required'
  },
  providerData: {},
  additionalProvidersData: {},
  group: {
    type: Schema.ObjectId,
    ref: 'Group'
  },
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop'
  },
  roles: {
    type: [
      {
        type: String,
        enum: ['user', 'admin', 'manager']
      }
    ],
    default: ['user'],
    required: 'Please provide at least one role'
  },
  privacy: {
    canOtherUsersViewMyProducts: {
      type: Boolean,
      default: false
    }
  },
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Hook a pre validate method to test the local password
 */
UserSchema.pre('validate', function (next) {
  if (this.provider === 'local' && this.password && this.isModified('password')) {
    var result = owasp.test(this.password);
    if (result.errors.length) {
      var error = result.errors.join(' ');
      this.invalidate('password', error);
    }
  }

  next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto
      .pbkdf2Sync(password, new Buffer.from(this.salt, 'base64'), 10000, 64, 'SHA1')
      .toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
  var _this = this;
  var possibleUsername = username.toLowerCase() + (suffix || '');

  _this.findOne(
    {
      username: possibleUsername
    },
    function (err, user) {
      if (!err) {
        if (!user) {
          callback(possibleUsername);
        } else {
          return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
        }
      } else {
        callback(null);
      }
    }
  );
};

/**
 * Generates a random passphrase that passes the owasp test
 * Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
 * NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
 */
UserSchema.statics.generateRandomPassphrase = function () {
  return new Promise(function (resolve, reject) {
    var password = '';
    var repeatingCharacters = new RegExp('(.)\\1{2,}', 'g');

    // iterate until the we have a valid passphrase
    // NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present
    while (password.length < 20 || repeatingCharacters.test(password)) {
      // build the random password
      password = generatePassword.generate({
        length: Math.floor(Math.random() * 20) + 20, // randomize length between 20 and 40 characters
        numbers: true,
        symbols: false,
        uppercase: true,
        excludeSimilarCharacters: true
      });

      // check if we need to remove any repeating characters
      password = password.replace(repeatingCharacters, '');
    }

    // Send the rejection back if the passphrase fails to pass the strength test
    if (owasp.test(password).errors.length) {
      reject(new Error('An unexpected problem occurred while generating the random passphrase'));
    } else {
      // resolve with the validated passphrase
      resolve(password);
    }
  });
};

UserSchema.statics.seed = seed;

mongoose.model('User', UserSchema);

/**
 * Seeds the User collection with document (User)
 * and provided options.
 */
function seed(doc, options) {
  var User = mongoose.model('User');

  return new Promise(function (resolve, reject) {
    skipDocument()
      .then(findAdminGroup)
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function findAdminGroup(skip) {
      var Group = mongoose.model('Group');

      return new Promise(function (resolve, reject) {
        if (skip) {
          return resolve(true);
        }

        if (doc.roles.includes('admin')) {
          Group.findOne({
            name: 'admin'
          }).exec(function (err, group) {
            if (err) {
              return reject(err);
            }

            doc.group = group;

            return resolve();
          });
        }

        if (doc.roles.includes('user')) {
          Group.findOne({
            name: 'user'
          }).exec(function (err, group) {
            if (err) {
              return reject(err);
            }

            doc.group = group;

            return resolve();
          });
        }
      });
    }

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        User.findOne({
          username: doc.username
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

          // Remove User (overwrite)

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
            message: chalk.yellow('Database Seeding: User\t\t' + doc.username + ' skipped')
          });
        }

        User.generateRandomPassphrase()
          .then(function (passphrase) {
            var user = new User(doc);

            user.provider = 'local';
            user.displayName = user.firstName + ' ' + user.lastName;
            user.password = passphrase;

            user.save(function (err) {
              if (err) {
                return reject(err);
              }

              return resolve({
                message:
                  'Database Seeding: User\t\t' +
                  user.username +
                  ' added with password set to ' +
                  passphrase
              });
            });
          })
          .catch(function (err) {
            return reject(err);
          });
      });
    }
  });
}
