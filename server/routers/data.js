var express = require('express');
var router = express.Router();
var filters = require('../filter.js');
var CONSTANTS = require('../config/constants');
var User = require('../models/user_model');
var async = require('async');
var moment = require('moment');
const crypto = require('crypto');
var validator = require('validator');
var Q = require('q');
var Data = require('../models/data_model');
var aws = require('aws-sdk');
var express = require('express');
var multer = require('multer');
var multerS3 = require('multer-s3');
var uuid = require('uuid-v4');
var wkhtmltopdf = require('wkhtmltopdf');

aws.config.region = 'us-west-2';
aws.config.update(
	{
		accessKeyId: 'AKIAI3B742VNH5RTGMAQ', 
		secretAccessKey: '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', 
		region:"eu-west-1"
	}
);

var s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'asjupload',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, uuid()+"_"+file.originalname);
    }
  })
});

var config = require('../config/config');


router.all('*', filters.verifyUser, filters.logRequest, filters.verifyTimestamp, filters.verifyNonce);


router.post('/metadata', (req, res, next) => {
	console.log("Post Meatadata");
	var user  = req.loginStatus.user;

	if(!req.body.metadata) {
		res.status(500).send("Metadata Should Be Provided");
	}

	var data = new Data.DataModel({
		user : user,
		metadata : req.body.metadata
	});

	data.save()
	.then((doc) => {
		console.log("Hence The Data Is Saved")
		res.status(200).send(doc);
	})
	.then((err) => {
		res.status(500).send(err.message);
	});

});


router.get('/', (req, res, next) => {
	Data.DataModel.find({
		user : req.loginStatus.user.id
	})
	.limit(req.query.limit || 10)
	.exec((err, results) => {
		if(err) {
			res.status(500).send();
		}
		res.status(200).send(results);
	});
});

router.get('/:id', (req, res, next) => {
	Data.DataModel.findOne({
		user : req.loginStatus.user.id,
		_id : req.params.id
	})
	.limit(req.query.limit || 10)
	.exec((err, results) => {
		if(err) {
			res.status(500).send();
		}
		res.status(200).send(results);
	});
});

router.post("/getPdf/:id", (req, res, next) => {
	if(!req.body) {
		res.status(400).send({'error' : "please send a valid url {url : <>}"});
		return;
	}
	res.setHeader('Content-Type', 'text/pdf');
	try{
		wkhtmltopdf(req.body.url, {
			'javascript-delay' : 2000
		}, function(code, signal) {
			console.log(code);
		}).pipe(res);  
	} catch(e) {
		res.status(500).send({'error' : "An unexpected error has occured please try again" + e});
	}
});



router.post('/upload/image',
upload.array('photos'), 
(req, res, next) => {
	res.status(200).send(req.files);
});

module.exports = router;
