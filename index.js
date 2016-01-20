/*!
 * vinyl-bufferstream | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/vinyl-bufferstream
*/
'use strict';

var File = require('vinyl');
var stream = require('readable-stream');

module.exports = function VinylBufferStream(fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('VinylBufferStream expects a function.');
  }

  return function vinylBufferStream(file, cb) {
    if (typeof cb !== 'function') {
      throw new TypeError(
        'The second argument to a VinylBufferStream instance must be a function.'
      );
    }

    if (!File.isVinyl(file)) {
      cb(new TypeError('Expecting a vinyl file object.'));
      return;
    }

    if (file.isNull()) {
      cb(null, null);
      return;
    }

    if (file.isStream()) {
      var buf = [];
      var through = new stream.Transform({
        transform: function(chunk, encoding, next) {
          buf.push(chunk);
          next();
        },
        flush: function(done) {
          fn(Buffer.concat(buf), function(err, buffer) {
            if (err) {
              return cb(err);
            }
            this.push(buffer);
            cb(null, contents);
            return done();
          }.bind(this));
        }
      });

      var contents = file.contents.pipe(through);
      return;
    }

    fn(file.contents, cb);
  };
};
