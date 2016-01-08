var test = require('tape');
var fs = require('fs');
var thumbnailStream = require('../index.js').ThumbnailStream({ size: 150 });
var dir = './tmp';
if (fs.existsSync(dir)) fs.rmdirSync(dir);
fs.mkdirSync(dir);
var writePNGStream = require('../index.js').WritePNGStream(dir);
var mapnik = require('mapnik');
var light = fs.readFileSync('./test/fixtures/light.png');
var dark = fs.readFileSync('./test/fixtures/dark.png');
var wide = fs.readFileSync('./test/fixtures/wide.png');
var small = fs.readFileSync('./test/fixtures/small.png');
var a = fs.readFileSync('./test/fixtures/a.png'); 
var b = fs.readFileSync('./test/fixtures/b.png'); 

var count = 0;
test('thumbnail stream', function(assert) {
    var results = [];
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

test('write png stream', function(assert) {
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
