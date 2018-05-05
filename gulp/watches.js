const gulp = require("gulp"),
      watch = require("gulp-watch");
   
gulp.task("watch", () => {   
    watch("./public/scripts/*.js", () =>{  
        gulp.start("minifyJs");        
    });
    watch("./public/styles/*.scss", () =>{        
        //gulp.start("styles");  
        gulp.start("cssInject");      
    });       
});