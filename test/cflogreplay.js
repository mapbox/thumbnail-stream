#!/usr/bin/env node

// Expects logfile as stdin
var fs = require('fs');
var split = require('split');
var stream = require('stream');
var thumbnailStream = require('../index.js').ThumbnailStream({ size: 150 });
var dir = './tmp';
fs.mkdirSync(dir);
var writePNGStream = require('../index.js').WritePNGStream(dir);
var reader = require('cloudfront-log-reader');
var reqStream = reader.RequestStream({ baseurl: 'https://api.mapbox.com' });

process.stdin
    .pipe(split())
    .pipe(reqStream)
    .pipe(thumbnailStream)
    .pipe(writePNGStream)
    .on('error', function(err) {
        console.error(err);
        process.exit(1);
    })
    .on('data', function(data) {
    })
    .on('end', function() {
    });

// http://api-gl-production-VPC-1305749750.us-west-1.elb.amazonaws.com
