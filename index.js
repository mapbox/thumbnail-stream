var stream = require('stream');
var mapnik = require('mapnik');
var fs = require('fs');

module.exports = {};
module.exports.ThumbnailStream = ThumbnailStream;
module.exports.WritePNGStream = WritePNGStream;

function ThumbnailStream(options) {
    // options.sample?

    // input is stream of objects in cflogreplay format
    var thumbnailStream = new stream.Transform({ objectMode: true });
    thumbnailStream._transform = function(data, enc, callback) {
        mapnik.Image.fromBytes(data.body, function(err, res) {
            if (err) return callback(err);
            if (!options.width) options.width = res.width();
            if (!options.height) options.height = res.height();
            var thumb = thumbnail(res, options);
            if (thumb) thumbnailStream.push(thumb);
            callback();
        });
    };
    // output is stream of thumbnail PNG image buffers to write
    return thumbnailStream;
};

function thumbnail(png, options) {
    if (!options.size) options.size = 150;
    if (options.size > options.height || options.size > options.width) return;
    var img = new mapnik.Image(options.size, options.size);

    // crop
    if (options.height > options.width) {
        options.height = options.width;
    } else if (options.width > options.height) {
        options.width = options.height;        
    }


    // round down to something divisible by size
    options.height = options.height - (options.height % options.size);
    options.width = options.height;

    // divide that by size, that's n
    var n = options.width/options.size;
    for (var i = 0; i < options.width; i = i + n) {
        for (var j = 0; j < options.width; j = j + n) { 
            var a = [i, j];
            var b = [(i + n), (j + n)];

            var block = getblock(a, b);
            var pixel = average(block);
            if (!pixel) return;
            
            // put it somewhere in thumbnail
            var x = i/n;
            var y = j/n;
            try {
                img.setPixel(x, y, pixel);
            } catch(e) {
                //console.log(e); 
            }
        }
    }
    var buffer = img.encodeSync('png');
    return buffer;

    function getblock(a, b) {
        if (a.length !== 2 || b.length !== 2) return;
        // a and b are coordinates: looking for pixels bounded by (a[0], a[1]) & (b[0], b[1])
        var pixels = [];
        for (var i = a[0]; i < b[0]; i++) {
            for (var j = a[1]; j < b[1]; j++) {
                var p = png.getPixel(i, j, { get_color: true }); // this can return undefined
                if (p) pixels.push(p);
            }
        }
        // output is array of pixels
        return pixels;
    };

    function average(pixels) {
        if (!pixels.length) return;
        //input is an array of pixels and output is one pixel that averages those
        var rSum = 0;
        var gSum = 0;
        var bSum = 0;
        var aSum = 0;
        pixels.forEach(function(pixel) {
            rSum = rSum + pixel.r;
            gSum = gSum + pixel.g;
            bSum = bSum + pixel.b;
            aSum = aSum + pixel.a;
        });

        var p = {
            r: Math.floor(rSum/pixels.length),
            g: Math.floor(gSum/pixels.length),
            b: Math.floor(bSum/pixels.length),
            a: Math.floor(aSum/pixels.length)
        };
        // sum r's g's and b's and spit back the average as p
        var pixel = new mapnik.Color('rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + p.a + ')');
        return pixel;
    };
};

function WritePNGStream(dir) {
    // input is stream of PNG image buffers
    var writePNGStream = new stream.Transform();
    var count = 0;
    writePNGStream._transform = function(data, enc, callback) {
        if (!data) return callback();
        fs.writeFileSync(dir + '/' + count + '.png', data);
        count++;
        callback();
    };
    return writePNGStream;
};
