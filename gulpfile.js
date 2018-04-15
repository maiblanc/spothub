// constants
const srcBaseDir = 'mock/src';
const destBaseDir = 'mock/dest'

// import packages
const gulp = require('gulp');
const browserSync = require('browser-sync');
const htmlExtend = require('gulp-html-extend');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const babel = require('gulp-babel');

// browser reload
gulp.task('default', ['browser-sync']);
gulp.task('browser-sync', () => {
  browserSync({
    server: {
      baseDir: destBaseDir + '/',
      index: 'index.html'
    }
  })
})
gulp.task('browser-reload', () => {
  browserSync.reload();
});

// html-extend
gulp.task('html-extend', () => {
  gulp.src(srcBaseDir + '/**/[^_]*.html', {
    base: srcBaseDir + '/content'
  })
      .pipe(plumber({
        errorHandler: notify.onError("エラー: <%= error.message %>")
      }))
  	  .pipe(htmlExtend({
  	  	annotations: true,
  	  	verbose: false
  	  }))
  	  .pipe(gulp.dest('./' + destBaseDir));
});

// js-compile
gulp.task('js-compile', () => {
  gulp.src(srcBaseDir + '/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['@babel/env']
      }))
      .pipe(concat('main.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./' + destBaseDir))
});

// sass-compile
gulp.task('sass-compile', () => {

});

// watch
gulp.task('default', ['browser-sync'], () => {
  gulp.watch(srcBaseDir + '/**/*.html', ['html-extend']);
  gulp.watch(srcBaseDir + '/**/*.js', ['js-compile']);
  gulp.watch(srcBaseDir + '/**/*.scss', ['sass-compile']);
  gulp.watch(destBaseDir + '/**/*.html', ['browser-reload']);
});