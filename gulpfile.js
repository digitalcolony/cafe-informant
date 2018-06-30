const gulp = require("gulp");
const del = require("del");
const merge = require("gulp-merge-json");

gulp.task("clearJSON", function() {
  del(["report/*.json"]).then(paths => {
    console.log("Deleted JSON files");
  });
});

gulp.task("mergeJSON", function() {
  gulp
    .src("report/*.json")
    .pipe(merge())
    .pipe(gulp.dest("report/"));
});
