'use strict';

var mongoose = require('mongoose'),
  Project = mongoose.model('Project'),
  Core = mongoose.model('Core'),
  validator = require('validator');

/**
 * Render the main application page
 */
exports.renderIndex = function (req, res) {

  var safeUserObject = null;
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
      additionalProvidersData: req.user.additionalProvidersData
    };
  }

  res.render('modules/core/server/views/index', {
    user: req.user || null
//todo - the `safeUserObject` is new addition to MEANjs stack -- need to look at docs for this
    //user: safeUserObject
  });
};

/**
 * Render the server error page
 */
exports.renderServerError = function (req, res) {
  res.status(500).render('modules/core/server/views/500', {
    error: 'Oops! Something went wrong...'
  });
};

/**
 * Render the server not found responses
 * Performs content-negotiation on the Accept HTTP header
 */
exports.renderNotFound = function (req, res) {

  res.status(404).format({
    'text/html': function () {
      res.render('modules/core/server/views/404', {
        url: req.originalUrl
      });
    },
    'application/json': function () {
      res.json({
        error: 'Path not found'
      });
    },
    'default': function () {
      res.send('Path not found');
    }
  });
};

/**
 *
 * Basic CRUD operations by a sourceId
 *
 */


//myObject.findAndModify({
//  query: {
//    sourceId: data.sourceId
//  },
//  update: {
//    $set: {
//      name: data.name,
//      active: data.active
//    },
//    $setOnInsert: {
//      createdAt: now,
//      sourceId: shortid.generate()
//    }
//  },
//  fields: excludeFields,
//  upsert: true,
//  new: true
//}, callback);
