var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var streamify = require('gulp-streamify');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var uglify = require('gulp-uglify');

gulp.task('lint', lint);

function lint() {
  return gulp.src('./*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
}


var bundler = watchify(browserify('./js/index.js', watchify.args));
// add any other browserify options or transforms here
// bundler.transform('brfs');

gulp.task('js', bundle); // so you can run `gulp js` to build the file
bundler.on('update', bundle); // on any dep update, runs the bundler
bundler.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('impulse.js'))
    // optional, remove if you dont want sourcemaps
    //  .pipe(buffer())
    //  .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    //  .pipe(sourcemaps.write('./')) // writes .map file
    //
    .pipe(gulp.dest('./js/dist'))
    .pipe(rename('impulse.min.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest('./js/dist'));
}
