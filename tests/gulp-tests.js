'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var scsslint = require('gulp-scss-lint');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var target = {
  testSass: [
    './client/stylesheets/pages/**/*.scss',
    './client/stylesheets/shared/**/*.scss',
    './client/stylesheets/utilities/**/*.scss',
    './client/stylesheets/main.scss'
  ],

  testJs: [
    './client/js/**/*.js',
    './server/**/*.js',
    './server.js'
  ]
}

gulp.task('test-sass', function() {
  return gulp.src(target.testSass)
  .pipe(plumber())
  .pipe(scsslint({
      'config': 'scss-lint.yml',
      'reporterOutput': 'scssReport.json',
    }))
    .pipe(scsslint.failReporter('E'))
})

gulp.task('test-js', function() {
  return gulp.src(target.testJs)
    .pipe(plumber())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
});

gulp.task('tests', ['test-sass', 'test-js'])