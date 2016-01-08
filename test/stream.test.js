var test = require('tape');
var fs = require('fs');
var mapnik = require('mapnik');
var light = fs.readFileSync('./test/fixtures/light.png');
var dark = fs.readFileSync('./test/fixtures/dark.png');
var wide = fs.readFileSync('./test/fixtures/wide.png');
var small = fs.readFileSync('./test/fixtures/small.png');
var a = fs.readFileSync('./test/fixtures/a.png'); 
var b = fs.readFileSync('./test/fixtures/b.png'); 

test('thumbnail stream', function(assert) {
    var thumbnailStream = require('../index.js').ThumbnailStream({ size: 150 });
    var results = [];
    var count = 0;
    thumbnailStream.on('data', function(d) {
        mapnik.Image.fromBytes(d, function(err, res) {
            assert.ifError(err);
            count++
            results.push(res);
            assert.equal(res.width(), 150);
            assert.equal(res.height(), 150);
            if (count > 5) end();
        });
    });
    thumbnailStream.on('end', function() {
        count++;
        if (count > 5) end();
    });
    thumbnailStream.write({ body: light });
    thumbnailStream.write({ body: dark });
    thumbnailStream.write({ body: wide });
    thumbnailStream.write({ body: small }); //ignored
    thumbnailStream.write({ body: a });
    thumbnailStream.write({ body: b });
    thumbnailStream.end();

    function end() {
        assert.equal(results.length, 5);
        assert.end();
    }
});

test('thumbnail stream [sample]', function(assert) {
    var thumbnailStream = require('../index.js').ThumbnailStream({
            size: 150,
            sample: 2
    });
    var results = [];
    thumbnailStream.on('data', function(d) {
        results.push(d);
    });
    thumbnailStream.on('end', function() {
        assert.equal(results.length, 2);
        assert.end();
    });
    thumbnailStream.write({ body: a });
    thumbnailStream.write({ body: b });
    thumbnailStream.write({ body: a });
    thumbnailStream.write({ body: b });
    thumbnailStream.end();
});

test('write png stream', function(assert) {
    var dir = './tmp';
    if (fs.existsSync(dir)) fs.rmdirSync(dir);
    fs.mkdirSync(dir);
    var writePNGStream = require('../index.js').WritePNGStream(dir);
    writePNGStream.on('data', function(d) {
    });
    writePNGStream.on('end', function() {
        assert.ok(fs.existsSync(dir + '/0.png')); 
        assert.ok(fs.existsSync(dir + '/1.png'));
        fs.unlinkSync(dir + '/0.png');
        fs.unlinkSync(dir + '/1.png');
        fs.rmdirSync(dir)
        assert.end();
    });
    writePNGStream.write(light);
    writePNGStream.write(dark);
    writePNGStream.end();
});
