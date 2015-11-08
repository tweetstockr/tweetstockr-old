'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var requireDir = require('require-dir');
var dir = requireDir('./tests/');

var target = {
  stylesheets_src: './client/stylesheets/**/*.scss',
  stylesheets_dist: './dist/stylesheets/',

  scripts_src: [
    './client/scripts/app.js',
    './client/scripts/filters/*.js',
    './client/scripts/controllers/*.js',
    './client/scripts/directives/*.js',
    './client/scripts/services/*.js',
    './client/scripts/directives/*.js',
  ],
  scripts_dist: './dist/scripts/'
}

gulp.task('stylesheets', function() {
  return gulp.src(target.stylesheets_src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: [
          'last 2 version'
        , 'safari 5'
        , 'ie 8'
        , 'ie 9'
        , 'opera 12.1'
        , 'ios 6'
        , 'android 4'
      ],
      cascade: false
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(target.stylesheets_dist))
    .pipe(notify('aehOo Stylesheets!'))
});

gulp.task('scripts', function() {
  return gulp.src(target.scripts_src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(target.scripts_dist))
    .pipe(notify('aehOo Scripts!'))
});

gulp.task('browserSync', function() {
  browserSync({
    proxy: 'localhost:3000',
    options: {
      reloadDelay: 250
    },
    notify: false
  });
});

gulp.task('default', ['stylesheets', 'scripts', 'browserSync'], function() {
  gulp.watch(target.stylesheets_src, ['stylesheets']);
  gulp.watch(target.scripts_src, ['scripts']);
});