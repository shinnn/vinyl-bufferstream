# vinyl-bufferstream

[![NPM version](https://img.shields.io/npm/v/vinyl-bufferstream.svg?style=flat)](https://www.npmjs.com/package/vinyl-bufferstream)
[![Build Status](https://img.shields.io/travis/shinnn/vinyl-bufferstream.svg?style=flat)](https://travis-ci.org/shinnn/vinyl-bufferstream)
[![Build status](https://ci.appveyor.com/api/projects/status/gqc8t4mju49p6fkn?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/vinyl-bufferstream)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/vinyl-bufferstream.svg?style=flat)](https://coveralls.io/r/shinnn/vinyl-bufferstream)
[![Dependency Status](https://img.shields.io/david/shinnn/vinyl-bufferstream.svg?style=flat&label=deps)](https://david-dm.org/shinnn/vinyl-bufferstream)
[![devDependency Status](https://img.shields.io/david/dev/shinnn/vinyl-bufferstream.svg?style=flat&label=devDeps)](https://david-dm.org/shinnn/vinyl-bufferstream#info=devDependencies)

Deal with [vinyl file](https://github.com/wearefractal/vinyl) contents, regardless of whether they are a Buffer or Stream

```javascript
var through = require('through2');
var VinylBufferStream = require('vinyl-bufferstream');

function yourGulpPlugin() {
  var vinylBufferStream = new VinylBufferStream(function(buf, done) {
    syncOrAsyncFn(buf, done); 
  });

  return through.obj(function(file, enc, cb) {
    vinylBufferStream(file, function(err, contents) {
      if (err) {
        self.emit('error', err);
      } else {
        file.contents = contents;
        self.push(file);
      }
      cb();
    });
  });
}
```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```sh
npm install vinyl-bufferstream
```

## API

```javascript
var VinylBufferStream = require('vinyl-bufferstream');
```

### vinylBufferStream = new VinylBufferStream(*transformFunction*)

(`new` operator is optional.)

*transformFunction*: `Function`  
Return: `Function`

The argument must be a function taking a [`Buffer`][buffer] and a callback function as it's first and second arguments, respectively. The callback will be invoked with [Node](http://nodejs.org/)-style callback arguments (`error, result`), where `result` is the buffered `file.contents`.

#### vinylBufferStream(*file*, *callback*)

*file*: `Object` ([vinyl file](https://github.com/wearefractal/vinyl#file) object)  
*callback*: `Function`

When `file.contents` is a [`Buffer`][buffer], it will call *transformFunction*, passing file.contents as the first argument.

When `file.contents` is a [`Stream`][buffer], it will call *transformFunction*, passing the buffered `file.contents` as the first argument.

When `file.contents` is`null`, it won't call the *transformFunction*.

##### callback(err, contents)

*error*: `Error` or `null`  
*contents*: [`Buffer`][buffer] or [`Stream`][stream]

When `file.contents` is a [`Buffer`][buffer], *contents* will be a result that *transformFunction* produces.

When `file.contents` is a [`Stream`][stream], *contents* will be a stream that emits the data *transformFunction* produces.

When `file.contents` is `null`, *contents* will be `null`.

```javascript
var gulp = require('gulp');
var SVGO = require('svgo');
var through = require('through2');
var VinylBufferStream = require('vinyl-bufferstream');

function svgminPlugin(options) {
  var svgo = new SVGO(options);
  var vinylBufferStream = new VinylBufferStream(function(buf, done) {
    svgo.optimize(String(buf), function(result) {
      if (result.error) {
        done(result.error);
        return;
      }
      done(null, result.data);
    });
  });

  return through.obj(function(file, enc, cb) {
    vinylBufferStream(file, function(err, contents) {
      if (err) {
        self.emit('error', err);
      } else {
        file.contents = contents;
        self.push(file);
      }
      cb();
    });
  });
}

gulp.task('buffer', function() {
  return gulp.src('*.svg')
    .pipe(svgminPlugin())
    .pipe(gulp.dest('dest'));
});

gulp.task('stream', function() {
  return gulp.src('*.svg', {buffer: false})
    .pipe(svgminPlugin())
    .pipe(gulp.dest('dest'));
});
```

## License

Copyright (c) 2014 - 2016 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).

[buffer]: https://nodejs.org/api/buffer.html
[stream]: https://nodejs.org/api/stream.html
