const gulp = require("gulp"), 
browserSync = require('browser-sync'),
reload = browserSync.reload,
nodemon = require('gulp-nodemon');   


////////////////////////////////////      
////////// INITIALIZATION //////////      
//////////////////////////////////// 

gulp.task("default", ['browser-sync'] , () => {
    gulp.start("watch");
    gulp.start("cssInject");
    gulp.watch(['./public/scripts/*.js'], reload);
    gulp.watch(['./views/**/*.hbs'], reload);
});

gulp.task('browser-sync', ['nodemon'], function() {
    browserSync({
        proxy: "localhost:80",  // local node app address
        port: 5000,  // use *different* port than above
        notify: true
    });
});

gulp.task('nodemon', function (cb) {
    var called = false;
    return nodemon({
        script: 'app.js',
        ignore: [
            'gulpfile.js',
            'node_modules/'
        ]
    })
    .on('start', function () {
        if (!called) {
            called = true;
            cb();
        }
    })
    .on('restart', function () {
        setTimeout(function () {
            reload({ stream: false });
        }, 3000);
    });
});