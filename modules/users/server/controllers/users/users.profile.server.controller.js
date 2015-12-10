'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  Project = mongoose.model('Project');

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables

  var user = req.user;


  // For security measurement we remove the roles from the req.body object
  if (req.body && req.body.roles !== undefined) {
    delete req.body.roles;
  }

  if (user) {
      var i = 0;
    // Merge existing user
    user = _.extend(user, req.body);
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
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
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};



/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};

