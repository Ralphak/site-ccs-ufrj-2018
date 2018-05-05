const gulp = require("gulp"),
babel = require('gulp-babel'),
uglify = require('gulp-uglify-es').default,
newer = require('gulp-newer'),
rename = require("gulp-rename");

//scripts manipulation
gulp.task("minifyJs", () => {    
    return gulp.src('./public/scripts/*.js')
    .pipe(newer({
        dest: "./public/dist/scripts/",
        ext: ".min.js"
    }))
    //se não habilitar o transpiler abaixo, é gerado código ES6 pelo gulp-uglify-es
    /* .pipe(babel({
      presets: ['es2015']
    })) */
    //habilitar o uglify para produção, comentar em desenvolvimento
    .pipe(uglify({mangle: false, ecma: 6 }))
    .pipe(rename(function(path){        
        path.extname = ".min.js";
    }))
    .pipe(gulp.dest("./public/dist/scripts"));    
});