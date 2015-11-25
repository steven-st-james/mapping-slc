'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('underscore'),
    mongoosastic = require('mongoosastic');

/**
 *
 * Project Schema
 * (also used for Admin panel)
 *
 **/

var ProjectSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    status: {
        type: [{
            type: String,
            enum: ['pending', 'rejected', 'revise and resubmit', 'accepted', 'published']
        }],
        default: 'pending'
    },
    publishedDate: {
        type: Date
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    modifiedOn: {
        type: Date
    },
    firstName: {
        type: String,
        ref: 'User'
    },
    lastName: {
        type: String,
        ref: 'User'
    },
    modifiedBy: {
        type: String,
        default: ''
    },
    street: {
        type: String,
        default: '',
        required: '',
        trim: true
    },
    city: {
        type: String,
        default: '',
        trim: true
    },
    state: {
        type: String,
        default: '',
        trim: true
    },
    zip: {
        type: Number,
        default: '',
        required: '',
        trim: true
    },
    title: {
        type: String,
        es_indexed: true,
        default: '',
        required: 'Please fill out the title of your submission',
        trim: true
    },
    shortTitle: {   //for featured projects, the title that will display in the street sign box
        type: String,
        es_indexed: true,
        default: '',
        trim: true
    },
    story: {
        type: String,
        es_indexed: true,
        default: 'This will be updated to the file you have uploaded',
        trim: true
    },
    storySummary: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        set: function (url) {
            if (!url) {
                return null;
            } else {
                if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                    url = 'http://' + url;
                }
                return url;
            }
        }
    },
    vimeoId: {
        type: String,
        es_indexed: true,
        trim: true
    },
    soundCloudId: {
        type: String,
        es_indexed: true,
        trim: true
    },
    lat: {
        type: Number,
        es_indexed: true,
        trim: true
    },
    lng: {
        type: Number,
        es_indexed: true,
        trim: true
    },
    //stores a static .map image, created on new project creation
    //calls from mapbox web services static .map image:
    //https://www.mapbox.com/developers/api/v1/static/#images
    mapImage: {
        type: String,
        trim: true
    },
    category: {
        type: [{
            type: String,
            enum: ['multimedia', 'essay', 'literature', 'interview', 'map', 'video', 'audio', 'this was here']
        }],
        trim: true
    },
    keywords: {
        type: [{
            type: String
        }]
    },
    tags: {
        type: Array
    },
    featured: {
        type: Boolean,
        default: 'false'
    },
    mainImage: {
        type: String,
        trim: true
    },
    mainImgThumbnail: {
        type: String,
        trim: true
    },
    imageGallery: {
        type: [{
            type: String
        }],
        trim: true
    },
    /**
    * specialLayout is an array of objects that specify custom layout options
    * for projects that have specific, custom layout requirements.
     * E.G., take a project that has both a video and an image gallery...
     * the standard layout would display the video on top of the image gallery.
     * however, you can specify here if the reverse should be true.
    */
    specialLayout: {
        type: [{
            type: Object
        }]
    }
});


//create virtual attribute for full address
ProjectSchema.virtual('address').get(function () {
    return this.street + ' ' + this.city + ' ' + this.state + ' ' + this.zip;
});

//create virtual attribute for full name
ProjectSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

//create virtual attribute setter for to spilt coordinates into lat and lng
ProjectSchema.virtual('geoCoordinates').get(function () {
    return this.lat + ', ' + this.lng;
}).set(function (geoCoordinates) {
    var splitCoordinates = geoCoordinates.split(', ');
    this.lat = splitCoordinates[0] || '';
    this.lng = splitCoordinates[1] || '';
});

//see mongoose-function library in node modules
//source: https://github.com/aheckmann/mongoose-function
//var defaultKeywords = [];
//ProjectSchema.methods.setDefaultKeywords = function(){
//    defaultKeywords.push(project.user, project.title);
//};
//console.log('defaultKeywords: ', defaultKeywords);

//// Using Mongoosastic to watch what's going on with the MongoDB server and feeding into Elastic Search
//ProjectSchema.plugin(mongoosastic);
//
//ProjectSchema.set('toJSON', {
//    getters: true,
//    virtuals: true
//});
//
//// Add model
//var Project = mongoose.model('Project', ProjectSchema),
//    stream = Project.synchronize(),
//    count = 0;
//
//stream.on('data', function (err, doc) {
//    count++;
//});
//stream.on('close', function () {
//    console.log('indexed ' + count + ' documents!');
//});
//stream.on('error', function (err) {
//    //console.log(err);
//});

mongoose.model('Project', ProjectSchema);
