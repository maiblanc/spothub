// constants
const srcBaseDir = 'mock/src';
const destBaseDir = 'mock/dest'

// import packages
const gulp = require('gulp');
const browserSync = require('browser-sync');
const htmlExtend = require('gulp-html-extend');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const sass = require('gulp-sass');
// const babel = require('gulp-babel');
// const concat = require('gulp-concat');
// const sourcemaps = require('gulp-sourcemaps');

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

// html-compile
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
  gulp.src(srcBaseDir + '/**/*.js', {
    base: srcBaseDir
  })
      .pipe(plumber({
        errorHandler: notify.onError("エラー: <%= error.message %>")
      }))
      /*.pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['env']
      }))
      .pipe(sourcemaps.write('.'))*/
      .pipe(gulp.dest('./' + destBaseDir));
});

// sass-compile
gulp.task('sass-compile', () => {
  gulp.src(srcBaseDir + '/**/*.scss', {
    base: srcBaseDir
  })
    .pipe(plumber({
      errorHandler: notify.onError("エラー: <%= error.message %>")
    }))
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(gulp.dest('./' + destBaseDir));
});

// watch
gulp.task('default', ['browser-sync'], () => {
  gulp.watch(srcBaseDir + '/**/*.html', ['html-extend']);
  gulp.watch(srcBaseDir + '/**/*.js', ['js-compile']);
  gulp.watch(srcBaseDir + '/**/*.scss', ['sass-compile']);
  gulp.watch(destBaseDir + '/**/*.{js,css,html}', ['browser-reload']);
});