var browserify = require('browserify');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var exec = require('child_process').exec;
var size = require('gulp-size');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('lint', function() {
  var sources = [
    'gulpfile.js',
    'assets/js/*.js',
    '!assets/js/search-bundle.js',
    'lib/jekyll_pages_api_search/*.js',
    '!lib/jekyll_pages_api_search/*.min.js',
    'test/**/*.js',
    '!test/index.js'
  ];

  return gulp.src(sources)
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('test-index', function(done) {
  exec('node test/helpers/build-test-index.js', done);
});

gulp.task('test-bundle', function() {
  var bundler = browserify('test/test-bundle.js');

  return bundler.bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(size())
    .pipe(gulp.dest('test'));
});

gulp.task('prepare-tests', ['test-index', 'test-bundle'], function(done) {
  done();
});
