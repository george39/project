'use strict';
const multer = require('multer');
const { resolve } = require('path');

const conf = {
  dest: './modules/manager-files/client/files/',
  limits: { fileSize: 4048576 }
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, require(resolve('./config/lib/multer')));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

var upload = multer({ storage: storage });

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);
  app.route('/api/users/privacy').get(users.getPrivacyOptions).post(users.updatePrivacyOptions);
  app.route('/api/users/workWithUs').post(upload.single('curriculum'), users.workWithUs);
  app
    .route('/api/users/getUsersThatUseThisProduct/:productId')
    .get(users.getUsersThatUseThisProduct);

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
