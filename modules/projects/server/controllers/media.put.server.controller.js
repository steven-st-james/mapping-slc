'use strict';


var mongoose = require('mongoose'),
  fs = require('fs'),
  path = require('path'),
  util = require('util'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  Project = mongoose.model('Project'),
  multiparty = require('multiparty'),
  config = require(path.resolve('./config/config')),
  projects = require('./projects.server.controller'),
  Promise = require('bluebird'),
  AWS = require('aws-sdk'),
  s3Config = {
    bucket: 'mapping-slc-file-upload',
    region: 'us-west-1',
    directory: [
      { name: 'project', path: 'project-directory' },
      { name: 'user', path: 'user-directory' },
      { name: 'admin', path: 'admin-directory' }
    ]
  },
  s3Url = 'https://' + s3Config.bucket + '.s3-' + s3Config.region + '.amazonaws.com',
  crypto = require('crypto'),
  moment = require('moment'),
  tinify = Promise.promisifyAll(require('tinify'));


/**
 *
 * Multiparty Middleware for Handling Multipart Form Data
 *
 * @param req
 * @param res
 * @param next
 */
exports.parseFileUpload = (req, res, next) => {
  // parse a file upload
  var form = new multiparty.Form();
  form.parse(req, function (err, fieldsObject, filesObject) {
    if (err) { console.log('parseFileUpload callback `err`:\n', err, '\n\n'); }
    if (!req.body) { return req.body = {}; }
    req.body.data = { fields: fieldsObject, files: filesObject };
    next();
  });
};

exports.configMainObj = (req, res, next) => {
  let file = req.body.data.files.file[0];
  if(/\s/g.test(file.originalFilename)) {
    file.originalFilename = fileName.replace(/\s/g, '_');
  }
  let fileStream = fs.createReadStream(file.path);
  let s3Obj = new Object({
    header: { 'x-amz-decoded-content-length': file.size },
    region: 'us-west-1',
    Bucket: s3Config.bucket,
    ContentLength: file.size,
    ContentType: file.headers['content-type'],
    Body: fileStream
  });
  req.body.s3Obj = s3Obj;
  next();
};


exports.configWysiwygObj = (req, res, next) => {
  req.body.s3Obj.aclLevel = 'read-only';
  req.body.s3Obj.Key = 'project-directory/' + project._id + '/' + fileName;
  req.body.s3Obj.Metadata = {
    linkedThumbUrl: 'https://s3-' + awsS3Config.region + '.amazonaws.com/' + s3Config.bucket + '/' + 'project-directory/' + project._id + '/' + fileName + '/thumbs'
  };
  next();
};


let _imageOptimizationAndThumb = (configObj) => {
  return _compressImage(configObj.file)
  .then(response => {
    console.log('response'.response);
    return _createThumbnail(configObj.projectId, configObj.fileName, configObj.filePathThumb);
  });
};


/**
 *
 * * Compress an image before uploading file
 *
 * @param {Buffer} file - image as buffer stream
 *
 * @returns {Buffer} optimizedImg
 * @private
 */
let _compressImage = (file) => {
  console.log('_compressImage fn  `file`\n', file, '\n\n');
  tinify.key = config.TINY_PNG_KEY;
  let compressionsThisMonth = tinify.compressionCount;
  console.log('compressionsThisMonth  before\n', compressionsThisMonth);

  // return tinify.fromBuffer(file).toBufferAsync()
  return tinify.fromFile(file).toBufferAsync()
  .then(response => {
    console.log('response from `_compressImage()\n', response);
    console.log('compressionsThisMonth  after\n', compressionsThisMonth);
    return response;
  });
};


/**
 *
 * sends image to TingPNG, which creates optimized thumbnail of image and then uploads thumb to s3
 *
 * @param {string} projectId
 * @param {string} fileName
 * @param {string} filePath
 *
 * @returns {string} optimizedImg
 * @private
 */
let _createThumbnail = (projectId, fileName, filePath, file) => {
  tinify.key = config.TINY_PNG_KEY;
  let source = tinify.fromFile(filePath);
  return source.resize({
    method: 'cover',
    width: 150,
    height: 150
  })
  .store({
    service: 's3',
    aws_access_key_id: config.S3_ID,
    aws_secret_access_key: config.S3_SECRET,
    region: 'us-west-1',
    path: s3Config.bucket + '/' + 'project-directory/' + projectId + '/thumbs/' + 'thumb_' + fileName
  });
};


/**
 *
 * Uploads images to s3 - stores files in `mapping-slc-file-upload/project-directory/<project-id>/`
 *
 * @param req
 * @param res
 */
exports.uploadProjectImages = (req, res) => {
  let project = {};
  if (req.project) {
    project = req.project;
  }

  let file = req.body.data.files.file[0],
    filePath = file.path,
    fileName = file.originalFilename,
    type = file.headers['content-type'];

  if (req.source === 'wysiwyg') {
    file.aclLevel = 'read-only'
  }
  if (/\s/g.test(fileName)) {
    fileName = fileName.replace(/\s/g, '_');
  }


  /** config aws s3 config settings, file object, and create a new instance of the s3 service */
  let awsS3Config = {
    accessKeyId: config.S3_ID,
    secretAccessKey: config.S3_SECRET,
    region: 'us-west-1',
    Key: 'project-directory/' + project._id + '/' + fileName,
    Bucket: s3Config.bucket
  };

  let imageFile = fs.createReadStream(filePath);

    let s3Obj = new Object({
      header: { 'x-amz-decoded-content-length': file.size },
      ACL: file.aclLevel || req.body.data.fields['data[securityLevel]'] || 'private',
      region: 'us-west-1',
      Key: 'project-directory/' + project._id + '/' + fileName,
      Bucket: s3Config.bucket,
      ContentLength: file.size,
      ContentType: type,
      Body: imageFile,
      Metadata: { linkedThumbUrl: 'https://s3-' + awsS3Config.region + '.amazonaws.com/' + s3Config.bucket + '/' + 'project-directory/' + project._id + '/' + fileName + '/thumbs' }
    });

    s3Obj.Body = imageFile;

    /** create new instance of S3 */
    let s3 = new AWS.S3(awsS3Config);

    /** upload image to S3 */
    s3.upload({ Bucket: s3Obj.Bucket, Key: s3Obj.Key, Metadata: s3Obj.Metadata, Body: s3Obj.Body })
    .on('httpUploadProgress', evt => {
      console.log('upload in progress: `evt`:\n', evt);
    })
    .send((err, uploadedImage) => {
      if(err) {
        console.log('s3 ERRor on UPLOAD :: `err`:\n', err);
        res.send( {message: 'Error uploading to s3', Error: err} );
      }
      console.log('s3 SUCCESSFUL UPLOAD :: `uploadedImage`:\n', uploadedImage);

      /** now save main document url and ETag to mongoDb */
      let imageDataObj = {
        mainImageUrl: 'https://s3-' + awsS3Config.region + '.amazonaws.com/' + s3Config.bucket + '/' + 'project-directory/' + project._id + '/' + fileName,
        fileEtags: uploadedImage.ETag
      };

      /** now save the image URLs to mongoDb */
      Project.update(imageDataObj);

      imageDataObj.link = imageDataObj.mainImageUrl;
      res.jsonp(imageDataObj);

  });
};


/**
 *
 * Uploads documents to s3:
 * * stores files path bucket: `mapping-slc-file-upload/project-directory/<project-id>/`
 * * url to access documents: ``
 *
 * @param req
 * @param res
 *
 */
exports.streamProjectDocuments = (req, res) => {

  var project = req.project;

  var file = req.body.data.files.file[0];
  var filePath = req.body.data.files.file[0].path;
  var fileName = req.body.data.files.file[0].originalFilename;
  var type = req.body.data.files.file[0].headers['content-type'];
  var aclLevel = req.body.data.fields['data[securityLevel]'];

  if (/\s/g.test(fileName)) {
    fileName = fileName.replace(/\s/g, '_');
  }

  /** config aws s3 config settings, file object, and create a new instance of the s3 service */
  let awsS3Config = {
    accessKeyId: config.S3_ID,
    secretAccessKey: config.S3_SECRET,
    region: 'us-west-1',
    Key: 'project-directory/' + project._id + '/' + fileName,
    Bucket: s3Config.bucket
  };
  let fileStream = fs.createReadStream(filePath);
  let s3Obj = {
    header: { 'x-amz-decoded-content-length': file.size },
    ACL: aclLevel || 'private',
    region: 'us-west-1',
    Key: 'project-directory/' + project._id + '/' + fileName,
    Bucket: s3Config.bucket,
    ContentLength: file.size,
    ContentType: type,
    Body: fileStream
    // ServerSideEncryption: 'AES256'
  };


  /** now upload document to S3 */
  let s3 = new AWS.S3(awsS3Config);

  s3.upload({ Bucket: s3Obj.Bucket, Key: s3Obj.Key, Metadata: {}, Body: s3Obj.Body })
  .on('httpUploadProgress', function (evt) {
    console.log(evt);
  })
  .send(function (err, data) {
    if (err) {
      console.log('s3 upload error message:\n', err);
    }
    console.log('s3 upload project files :: SUCCESSFUL UPLOAD :: Response var `data`:\n', data);

    /** now save main document url and ETag to mongoDb */
    let updatedProject = {
      fileUrls: data.Location,
      fileEtags: data.ETag
    };
    Project.update(updatedProject);

    /** now respond with a success message */
    // res.jsonp({ message: 's3 file upload was successful', mainImageUrl: data.Location });

    let response = {
      message: 's3 file upload was successful',
      s3Obj: s3Obj
    };
    res.jsonp(response);

  });

};
