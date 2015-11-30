'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  defaultAssets = require('./config/assets/default'),
  testAssets = require('./config/assets/test'),
  gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  runSequence = require('run-sequence'),
  plugins = gulpLoadPlugins({
    rename: {
      'gulp-angular-templatecache': 'templateCache'
    }
  }),
  path = require('path'),
  endOfLine = require('os').EOL;

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
  process.env.NODE_ENV = 'test';
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
  process.env.NODE_ENV = 'development';
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
  process.env.NODE_ENV = 'production';
});

// Nodemon task
gulp.task('nodemon', function () {
  return plugins.nodemon({
    script: 'server.js',
    nodeArgs: ['--debug'],
    ext: 'js,html',
    watch: _.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config)
  });
});

// Watch Files For Changes
gulp.task('watch', function () {
  // Start livereload
  plugins.livereload.listen();

  // Add watch rules
  gulp.watch(defaultAssets.server.views).on('change', plugins.livereload.changed);
  //gulp.watch(defaultAssets.client.sass, ['sass']).on('change', plugins.livereload.changed);
  //gulp.watch(defaultAssets.client.less, ['less']).on('change', plugins.livereload.changed);

  if (process.env.NODE_ENV === 'production') {
    gulp.watch(defaultAssets.server.gulpConfig, ['templatecache']);
    gulp.watch(defaultAssets.client.views, ['templatecache']).on('change', plugins.livereload.changed);
  } else {
    gulp.watch(defaultAssets.client.views).on('change', plugins.livereload.changed);
  }
});

//// CSS linting task
//gulp.task('csslint', function (done) {
//  return gulp.src(defaultAssets.client.css)
//    .pipe(plugins.csslint('.csslintrc'))
//    .pipe(plugins.csslint.reporter())
//    .pipe(plugins.csslint.reporter(function (file) {
//      if (!file.csslint.errorCount) {
//        done();
//      }
//    }));
//});
//
//// JS linting task
//gulp.task('jshint', function () {
//  var assets = _.union(
//    defaultAssets.server.gulpConfig,
//    defaultAssets.server.allJS,
//    defaultAssets.client.js,
//    testAssets.tests.server,
//    testAssets.tests.client,
//    testAssets.tests.e2e
//  );
//
//  return gulp.src(assets)
//    .pipe(plugins.jshint())
//    .pipe(plugins.jshint.reporter('default'))
//    .pipe(plugins.jshint.reporter('fail'));
//});

// JS minifying task
gulp.task('uglify', function () {
  var assets = _.union(
    defaultAssets.client.js,
    defaultAssets.client.templates
  );

  return gulp.src(assets)
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify({
      mangle: false
    }))
    .pipe(plugins.concat('application.min.js'))
    .pipe(gulp.dest('public/dist'));
});

// CSS minifying task
gulp.task('cssmin', function () {
  return gulp.src(defaultAssets.client.css)
    .pipe(plugins.cssmin())
    .pipe(plugins.concat('application.min.css'))
    .pipe(gulp.dest('public/dist'));
});

//// Sass task
//gulp.task('sass', function () {
//  return gulp.src(defaultAssets.client.sass)
//    .pipe(plugins.sass())
//    .pipe(plugins.autoprefixer())
//    .pipe(plugins.rename(function (file) {
//      file.dirname = file.dirname.replace(path.sep + 'scss', path.sep + 'css');
//    }))
//    .pipe(gulp.dest('./modules/'));
//});
//
//// Less task
//gulp.task('less', function () {
//  return gulp.src(defaultAssets.client.less)
//    .pipe(plugins.less())
//    .pipe(plugins.autoprefixer())
//    .pipe(plugins.rename(function (file) {
//      file.dirname = file.dirname.replace(path.sep + 'less', path.sep + 'css');
//    }))
//    .pipe(gulp.dest('./modules/'));
//});

// Angular template cache task
gulp.task('templatecache', function () {
  var re = new RegExp('\\' + path.sep + 'client\\' + path.sep, 'g');

  return gulp.src(defaultAssets.client.views)
    .pipe(plugins.templateCache('templates.js', {
      root: 'modules/',
      module: 'core',
      templateHeader: '(function () {' + endOfLine + '	\'use strict\';' + endOfLine + endOfLine + '	angular' + endOfLine + '		.module(\'<%= module %>\'<%= standalone %>)' + endOfLine + '		.run(templates);' + endOfLine + endOfLine + '	templates.$inject = [\'$templateCache\'];' + endOfLine + endOfLine + '	function templates($templateCache) {' + endOfLine,
      templateBody: '		$templateCache.put(\'<%= url %>\', \'<%= contents %>\');',
      templateFooter: '	}' + endOfLine + '})();' + endOfLine,
      transformUrl: function (url) {
        return url.replace(re, path.sep);
      }
    }))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('public/dist'));
});

// Mocha tests task
gulp.task('mocha', function (done) {
  // Open mongoose connections
  var mongoose = require('./config/lib/mongoose.js');
  var error;

  // Connect mongoose
  mongoose.connect(function () {
    // Run the tests
    gulp.src(testAssets.tests.server)
      .pipe(plugins.mocha({
        reporter: 'spec'
      }))
      .on('error', function (err) {
        // If an error occurs, save it
        error = err;
      })
      .on('end', function () {
        // When the tests are done, disconnect mongoose and pass the error state back to gulp
        mongoose.disconnect(function () {
          done(error);
        });
      });
  });

});

// Karma test runner task
gulp.task('karma', function (done) {
  return gulp.src([])
    .pipe(plugins.karma({
      configFile: 'karma.conf.js',
      action: 'run',
      singleRun: true
    }));
});

// Selenium standalone WebDriver update task
gulp.task('webdriver-update', plugins.protractor.webdriver_update);

// Protractor test runner task
gulp.task('protractor', function () {
  gulp.src([])
    .pipe(plugins.protractor.protractor({
      configFile: 'protractor.conf.js'
    }))
    .on('error', function (e) {
      throw e;
    });
});

//// Lint CSS and JavaScript filees.
//gulp.task('lint', function (done) {
//  runSequence('less', 'sass', ['csslint', 'jshint'], done);
//});

// Lint project files and minify them into two production files.
gulp.task('build', function (done) {
  runSequence('env:dev', ['uglify', 'cssmin'], done);
});

// Run the project tests
gulp.task('test', function (done) {
  runSequence('env:test', ['karma', 'mocha'], done);
});

gulp.task('test:server', function (done) {
  runSequence('env:test', ['mocha'], done);
});

gulp.task('test:client', function (done) {
  runSequence('env:test', ['karma'], done);
});

// Run the project in development mode
gulp.task('default', function (done) {
  runSequence('env:dev', ['nodemon', 'watch'], done);
});

// Run the project in debug mode
gulp.task('debug', function (done) {
  runSequence('env:dev', ['nodemon', 'watch'], done);
});

// Run the project in production mode
gulp.task('prod', function (done) {
  runSequence('templatecache', 'build', 'env:prod', ['nodemon', 'watch'], done);
});

// Run the project in production mode
gulp.task('heroku', function (done) {
  runSequence('templatecache', 'env:prod', ['uglify', 'cssmin'], ['nodemon', 'watch'], done);
});
