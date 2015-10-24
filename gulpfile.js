var gulp = require('gulp');

var runSequence = require('run-sequence');

gulp.task('default', ['lint', 'tsc', 'tsc-tests', 'bundle-js', 'bundle-test']);

/*
gulp.task('default', function(cb) {
  runSequence(
    'lint',                      // lint
    ['tsc', 'tsc-tests'],        // compile
    ['bundle-js','bundle-test'], // optimize
    'karma'                      // test
    'browser-sync',              // serve
    cb                           // callback
  );
});
*/

var tslint = require('gulp-tslint');

gulp.task('lint', function(){
	return gulp.src(['./source/ts/**/**.ts', './test/ts/**/**.ts']).pipe(tslint()).pipe(tslint.report('verbose'));
});

var ts = require('gulp-typescript');
var tsProject = ts.createProject({
    removeComments : true,
    noImplicitAny : true,
    target : 'ES3',
    module : 'commonjs',
    declarationFiles : false
});

gulp.task('tsc', function() {
return gulp.src('./source/ts/**/**.ts')
           .pipe(ts(tsProject))
           .js.pipe(gulp.dest('./temp/source/js'));
});

var tsTestProject = ts.createProject({
    removeComments : true,
    noImplicitAny : true,
    target : 'ES3',
    module : 'commonjs',
    declarationFiles : false
});

gulp.task('tsc-tests', function() {
  return gulp.src('./test/**/**.test.ts')
             .pipe(ts(tsTestProject ))
             .js.pipe(gulp.dest('./temp/test/'));
});


Var browserify  = require('browserify'),
    transform   = require('vinyl-transform'),
    uglify      = require('gulp-uglify'),
    sourcemaps  = require('gulp-sourcemaps');

var browserified = transform(function(filename) {
  var b = browserify({ entries: filename, debug: true });
  return b.bundle();
});

gulp.task('bundle-js', function () {
  return gulp.src('./temp/source/js/main.js')
             .pipe(browserified)
             .pipe(sourcemaps.init({ loadMaps: true }))
             .pipe(uglify())
             .pipe(sourcemaps.write('./'))
             .pipe(gulp.dest('./dist/source/js/'));
});

gulp.task('bundle-test', function () {
  return gulp.src('./temp/test/**/**.test.js')
             .pipe(browserified)
             .pipe(gulp.dest('./dist/test/'));
});

Var karma = require("gulp-karma");

gulp.task('karma', function(cb) {
  gulp.src('./dist/test/**/**.test.js')
      .pipe(karma({
         configFile: 'karma.conf.js',
         action: 'run'
       }))
       .on('end', cb)
       .on('error', function(err) {
         // Make sure failed tests cause gulp to exit non-zero
         throw err;
       });
});

gulp.task('bundle', function(cb) {
  runSequence('build', [
    'bundle-js', 'bundle-test'
  ], cb);
});

gulp.task('test', function(cb) {
  runSequence('bundle', ['karma'], cb);
});

var browserSync = require('browser-sync');
gulp.task('browser-sync', ['test'], function() {
  browserSync({
    server: {
      baseDir: "./dist"
    }
  });

  return gulp.watch([
    "./dist/source/js/**/*.js",
    "./dist/source/css/**.css",
    "./dist/test/**/**.test.js",
    "./dist/data/**/**",
    "./index.html"
  ], [browserSync.reload]);
});
