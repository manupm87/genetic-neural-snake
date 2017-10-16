var gulp        = require('gulp');
var gutil       = require('gulp-util');
var source      = require('vinyl-source-stream');
var babelify    = require('babelify');
var watchify    = require('watchify');
var browserify  = require('browserify');
var browserSync = require('browser-sync').create();

var gulp = require('gulp');
// add the browserSync module reference
var browserSync = require('browser-sync').create();


// we are creating a bundler instance which
// accepts a script.js file in the /src directory
// we use bundler to complete all the js tasks

// the debug arguments are for the creation of sourcemaps
watchify.args.debug = true;

var bundler = watchify(browserify('./src/engine.js', watchify.args));

// We are telling bundler to use the Babel presets
// es2015 and react (for JSX transpilation)
bundler.transform(babelify.configure({
  presets: ["react", "env", "es2015", "stage-0"]
}));

// When the bundler has detected a change, rebundle
bundler.on('update', bundle);

// The function that bundles
function bundle() {

  // remember gulp-util? Here's the usage of the log() function
  gutil.log('Bundling...');

  return bundler.bundle()
    .on('error', function (err) { // on error, let us know
      gutil.log(err.message);
      this.emit("end");
    })
    .pipe(source('bundle.js')) // the bundled file is passed along...
    .pipe(gulp.dest('dist')) // ...then spit out into the dist directory
    .pipe(browserSync.stream({ once: true })); // update the browser
}

// run "gulp bundle" as a command (optional)
gulp.task('bundle', function () {
  return bundle();
});

gulp.task('default', ['bundle'], function () {
  browserSync.init({
    server: "./"
  });

  // added a gulp watch function that reloads the browser
  // any time a change is made to the index.html file
  gulp.watch('index.html', function() {
    browserSync.reload();
  })
});
