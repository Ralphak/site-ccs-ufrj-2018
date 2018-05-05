const gulp = require("gulp"),
    newer = require('gulp-newer'),
    rename = require("gulp-rename"),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    stripCssComments = require('gulp-strip-css-comments'),
    browserSync = require('browser-sync'),
    cached = require("gulp-cached"), 
    sassPartialsImported = require("gulp-sass-partials-imported"),
    wait = require('gulp-wait');

gulp.task("styles", () => {
    return gulp.src('./public/styles/*.scss')
    .pipe(wait(250))
    .pipe(newer({
        dest: "./public/dist/styles/",
        ext: ".min.css"
    }))
    .pipe(cached('./public/styles/*.scss'))
    .pipe(sassPartialsImported('./public/styles/'))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))    
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))             
    .pipe(stripCssComments())
    .pipe(rename(function(path){  
        path.extname = ".min.css";
    }))
    .pipe(gulp.dest('./public/dist/styles/'))
});

//injecting processed ccs into browsersync without reload the browser
gulp.task("cssInject",["styles"], () => {
    return gulp.src("./public/dist/styles/*.css")
        .pipe(browserSync.stream());
});