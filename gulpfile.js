'use strict';

var gulp = require('gulp')
  , plumber = require('gulp-plumber')
  , browserSync = require('browser-sync')
  , jade = require('gulp-jade')
  , sass = require('gulp-sass')
  , csscss = require('gulp-csscss')
  , minify = require('gulp-cssnano')
  , prefix = require('gulp-autoprefixer')
  , concat = require('gulp-concat')
  , jshint = require('gulp-jshint')
  , stylish = require('jshint-stylish')
  , ngAnnotate = require('gulp-ng-annotate');

var path = {
  views: {
      input: 'public/views/**/*.jade'
    , output: 'dist/'
  },

  stylesheets: {
      input: 'public/stylesheets/**/*.scss'
    , output: 'dist/stylesheets'
  },

  scripts: {
      input: [
          'public/scripts/main.js'
        , 'public/scripts/services/**/*.js'
        , 'public/scripts/directives/**/*.js'
        , 'public/scripts/controllers/**/*.js'
      ]
    , output: 'dist/scripts'
  },

  assets: {
      input: 'public/assets/**/*'
    , output: 'dist/assets'
  }
}

gulp.task('build:views', function() {
  return gulp.src(path.views.input)
    .pipe(plumber())
    .pipe(jade())
    .pipe(gulp.dest(path.views.output))
    .pipe(browserSync.stream());
});

gulp.task('build:stylesheets', function() {
  return gulp.src(path.stylesheets.input)
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'expanded',
      sourceComments: true
    }))
    .pipe(prefix({
      browsers: ['last 2 version', '> 1%'],
      cascade: true,
      remove: true
    }))
    .pipe(minify({
      discardComments: {
        removeAll: true
      }
    }))
    .pipe(gulp.dest(path.stylesheets.output))
    // .pipe(csscss())
    .pipe(browserSync.stream());
})

gulp.task('build:scripts', function() {
  return gulp.src(path.scripts.input)
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(ngAnnotate())
    .pipe(gulp.dest(path.scripts.output))
    .pipe(browserSync.stream());
});

gulp.task('lint:scripts', function () {
  return gulp.src(path.scripts.input)
    .pipe(plumber())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build:assets', function() {
  return gulp.src(path.assets.input)
    .pipe(plumber())
    .pipe(gulp.dest(path.assets.output));
});

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'dist'
    },
    port: 9000,
    notify: false,
    files: 'bower_components/**/*',
    options: {
      reloadDelay: 50
    }
  });
});

gulp.task('compile', [
    'build:views'
  , 'build:stylesheets'
  , 'build:scripts'
  , 'build:assets'
]);

gulp.task('watcher', function() {
  gulp.watch(path.views.input, ['build:views']);
  gulp.watch(path.stylesheets.input, ['build:stylesheets']);
  gulp.watch(path.scripts.input, ['build:scripts']);
});

gulp.task('server', [
    'browserSync'
  , 'watcher'
]);

gulp.task('default', [
    'compile'
  , 'lint:scripts'
  , 'server'
]);
