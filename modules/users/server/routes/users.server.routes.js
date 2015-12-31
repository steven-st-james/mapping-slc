'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller'),
      assets = require('../controllers/users/users.uploader.server.controller');

  // Setting up the users profile api
  app.route('/api/v1/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);

  app.route('/api/v1/users/:userId/media/:mediaId')
    .get(assets.getS3File);

  app.route('/api/v1/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/v1/users/password').post(users.changePassword);
  app.route('/api/v1/users/media/photo').post(users.changeProfilePicture);

<<<<<<< HEAD
  app.route('/api/v1/s3/upload/media/photo').post(users.uploadUserProfileImage);
  app.route('/api/v1/s3/upload/project').post(users.uploadProject);
=======
  //app.route('/api/v1/s3/upload/media/photo').post(users.uploadUserProfileImage);
  app.route('/api/v1/s3/upload').post(users.uploadUserProfileImage);
>>>>>>> 2536f724a65c88f47abff3bf0831d533480a8ac6

  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
