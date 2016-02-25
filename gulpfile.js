'use strict';

/**
 * Dependencies
 */
var gulp = require('gulp')
  , jade = require('gulp-jade')
  , sass = require('gulp-sass')
  , sourcemaps = require('gulp-sourcemaps')
  , prefix = require('gulp-autoprefixer')
  , uglify = require('gulp-uglify')
  , concat = require('gulp-concat')
  , jshint = require('gulp-jshint')
  , stylish = require('jshint-stylish')
  , ngAnnotate = require('gulp-ng-annotate')
  , notify = require('gulp-notify')
  , plumber = require('gulp-plumber')
  , gulpif = require('gulp-if')
  , browserSync = require('browser-sync')
  , inject = require('gulp-inject')
  , flatten = require('gulp-flatten')
  , ghPages = require('gulp-gh-pages')
  , del = require('del');

/**
 * Environment
 */
var env = process.env.NODE_ENV || 'development';

/**
 * Paths
 */
var paths = {
  views: {
      input: './public/views/**/*.jade'
    , dev: './development/'
    , output: './dist'
  },

  stylesheets: {
      input: './public/stylesheets/**/*.scss'
    , dev: './development/stylesheets/'
    , output: './dist/stylesheets/'
  },

  scripts: {
      input: [
          './public/scripts/main.js'
        , './public/scripts/services/**/*.js'
        , './public/scripts/directives/**/*.js'
        , './public/scripts/controllers/**/*.js'
      ]
    , dev: './development/scripts/'
    , output: './dist/scripts/'
  },

  assets: {
      input: './public/assets/*'
    , dev: './development/assets/'
    , output: './dist/assets/'
  },

  bower: {
    css: {
        input: './bower_components/**/*.min.css'
      , dev: './development/stylesheets/vendors/'
      , output: './dist/stylesheets/vendors/'
    },
    js: {
        input: [
            './bower_components/**/*.min.js'
          , './bower_components/socket.io-client/socket.io.js'
        ]
      , dev: './development/scripts/vendors/'
      , output: './dist/scripts/vendors/'
    }
  },

  clean: {
      development: './development/'
    , dist: './dist/'
  },

  cname: {
      input: './CNAME'
    , dist: './dist/'
  },

  deploy: {
    input: './dist/**/*'
  }
}

/**
 * Builds
 */
gulp.task('build:views', function () {
  return gulp.src(paths.views.input)
    .pipe(plumber({errorHandler: notify.onError('Error Jade: <%= error.message %>')}))
    .pipe(gulpif(env === 'development', jade({pretty: true})))
    .pipe(gulpif(env === 'production', jade()))
    .pipe(gulpif(env === 'development', gulp.dest(paths.views.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.views.output)))
    .pipe(notify('Jade Compiled'))
    .pipe(browserSync.stream())
});

gulp.task('build:stylesheets', function () {
  return gulp.src(paths.stylesheets.input)
    .pipe(plumber({errorHandler: notify.onError('Error Sass: <%= error.message %>')}))
    .pipe(gulpif(env === 'development', sourcemaps.init()))
    .pipe(gulpif(env === 'development', sass()))
    .pipe(gulpif(env === 'production', sass({outputStyle: 'compressed'})))
    .pipe(gulpif(env === 'development', sourcemaps.write()))
    .pipe(gulpif(env === 'development', gulp.dest(paths.stylesheets.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.stylesheets.output)))
    .pipe(notify('Sass Compiled'))
    .pipe(browserSync.stream())
});

gulp.task('build:scripts', function () {
  return gulp.src(paths.scripts.input)
    .pipe(plumber({errorHandler: notify.onError('Error JS: <%= error.message %>')}))
    .pipe(gulpif(env === 'production', jshint('.jshintrc')))
    .pipe(gulpif(env === 'production', jshint.reporter('jshint-stylish')))
    .pipe(gulpif(env === 'development', sourcemaps.init()))
    .pipe(concat('main.js'))
    .pipe(gulpif(env === 'development', sourcemaps.write()))
    .pipe(gulpif(env === 'production', ngAnnotate({single_quotes: true})))
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulpif(env === 'development', gulp.dest(paths.scripts.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.scripts.output)))
    .pipe(notify('JS Compiled'))
    .pipe(browserSync.stream())
});

gulp.task('build:assets', function () {
  return gulp.src(paths.assets.input)
    .pipe(gulpif(env === 'development', gulp.dest(paths.assets.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.assets.output)))
});

/**
 * Server
 */
gulp.task('server:browserSync', function() {
  browserSync({
    server: {
      baseDir: ['./', './development']
    },
    port: 9000,
    notify: false,
    options: {
      reloadDelay: 50
    }
  });
});

 /**
  * Helpers
  */
gulp.task('helper:bowerComponentsCss', function () {
  gulp.src(paths.bower.css.input)
    .pipe(flatten())
    .pipe(gulpif(env === 'development', gulp.dest(paths.bower.css.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.bower.css.output)))
});

gulp.task('helper:bowerComponentsJs', function () {
  gulp.src(paths.bower.js.input)
    .pipe(flatten())
    .pipe(gulpif(env === 'development', gulp.dest(paths.bower.js.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.bower.js.output)))
});

gulp.task('helper:cname', function () {
  return gulp.src(paths.cname.input)
    .pipe(plumber())
    .pipe(gulp.dest(paths.cname.dist))
});

gulp.task('helper:clean', function () {
  del.sync([
    paths.clean.development
  ])

  del.sync([
    paths.clean.dist
  ])
});

gulp.task('helper:watcher', function() {
  gulp.watch(paths.views.input, ['build:views']);
  gulp.watch(paths.stylesheets.input, ['build:stylesheets']);
  gulp.watch(paths.scripts.input, ['build:scripts']);
})

gulp.task('deploy', ['default'], function () {
  return gulp.src(paths.deploy.input)
    .pipe(ghPages())
});

gulp.task('default', [
    'helper:clean'
  , 'build:views'
  , 'build:stylesheets'
  , 'build:scripts'
  , 'build:assets'
  , 'helper:bowerComponentsCss'
  , 'helper:bowerComponentsJs'
  , 'helper:cname'
  , 'server:browserSync'
  , 'helper:watcher'
])
