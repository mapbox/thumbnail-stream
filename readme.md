# thumbnail-stream

[![Build Status](https://travis-ci.com/mapbox/thumbnail-stream.svg?token=dkVUTgL9esjwon3C6rN3&branch=master)](https://magnum.travis-ci.com/mapbox/thumbnail-stream)

Generates thumbnails from a stream of PNG buffers.

```js
var thumbnailStream = require('thumbnail-stream').ThumbnailStream({ size: 250, sample: 2 });
var writePNGStream = require('thumbnail-stream').WritePNGStream('./tmp');
process.stdin
    .pipe(split())
    .pipe(thumbnailStream)
    .pipe(writePNGStream)
```

**ThumbnailStream**: input is a png buffer, output is png buffer resized to a thumbnail. Expects an object of options, all of which are optional.

Parameter | Description | Default
----------|-------------|--------
size | length of 1 side of resulting thumbnail | 350
sample | to only generate thumbnails for every `n`th buffer | 1

**WritePNGStream**: input is a png buffer, output is pngs written to provided location. Expects a path to where the pngs should be written. 

-------

## thumbnailstream

`thumbnailstream <baseurl> <size>`

This module also provides a cli wrapper command that replays requests against a `<baseurl>` generating png buffers, and captures the output as thumbnails in ./tmp. Expects paths to be piped to `stdin`. (Optional) `<size>` length of 1 side of resulting thumbnail, defaults to 350. Uses request stream from [cloudfront-log-reader](https://github.com/mapbox/cloudfront-log-reader).
