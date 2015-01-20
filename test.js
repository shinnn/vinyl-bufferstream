/* eslint new-cap:0 no-new:0 */
'use strict';

var bufferToStream = require('simple-bufferstream');
var File = require('vinyl');
var test = require('tape');
var VinylBufferStream = require('./');

var tmpError = new Error('Error.');

test('VinylBufferStream()', function(t) {
  t.plan(5);

  t.equal(VinylBufferStream.name, 'VinylBufferStream', 'should have a function name.');

  t.doesNotThrow(function() {
    new VinylBufferStream(t.fail);
  }, 'should create an instance as a function.');

  t.doesNotThrow(function() {
    VinylBufferStream(t.fail);
  }, 'should create an instance without `new` operator.');

  t.throws(
    function() {
      new VinylBufferStream('foo');
    },
    /TypeError.*foo is not a function/,
    'should throw a type error when the first argument is not a function.'
  );

  t.throws(
    function() {
      new VinylBufferStream();
    },
    /TypeError.*must be a function\./,
    'should throw a type error when it takes no arguments.'
  );
});

test('instance of VinylBufferStream()', function(t) {
  t.plan(9);

  var vinylBufferStream = new VinylBufferStream(function(buf, cb) {
    if (String(buf) === 'error') {
      cb(tmpError);
      return;
    }
    cb(null, Buffer.concat([new Buffer('prefix-'), buf]));
  });

  t.equal(vinylBufferStream.name, 'vinylBufferStream', 'should have a function name.');

  vinylBufferStream(new File(), function(err, contents) {
    t.deepEqual(
      [err, contents],
      [null, null],
      'should pass null to the callback when the file.contents is null.'
    );
  });

  vinylBufferStream(new File({contents: new Buffer('a')}), function(err, contents) {
    t.strictEqual(err, null, 'should accept vinyl file in buffer mode.');
    t.equal(
      String(contents),
      'prefix-a',
      'should pass a buffer of contents to the function.'
    );
  });

  vinylBufferStream(new File({contents: bufferToStream('a')}), function(err, contents) {
    t.strictEqual(err, null, 'should accept vinyl file in stream mode.');
    contents.on('data', function(data) {
      t.equal(
        String(data),
        'prefix-a',
        'should pass a stream to the callback when the contents is a stream.'
      );
    });
  });

  vinylBufferStream(new File({contents: bufferToStream('error')}), function(err, contents) {
    t.deepEqual(
      [err, contents],
      [tmpError, undefined],
      'should not pass contents to the callback when the the callback takes an error.'
    );
  });

  vinylBufferStream({}, function(err) {
    t.equal(
      err.message,
      'Expecting a vinyl file object.',
      'should pass an error to the callback when the first argument is not a vinyl file.'
    );
  });

  t.throws(
    vinylBufferStream.bind(null, new File(), 'foo'),
    /TypeError.*foo is not a function.*must be a function\./,
    'should throw a type error when the second argument is not a function.'
  );
});
