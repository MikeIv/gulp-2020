"use strict";

const gulp = require("gulp"); // Подключаем Gulp
const less = require("gulp-less"); //Подключаем Less пакет
const minifycss = require("gulp-csso"); // CSS минификатор
const plumber = require("gulp-plumber");
const autoprefixer = require("autoprefixer"); // Подключаем библиотеку для автопрефиксов
const postcss = require("gulp-postcss");
const posthtml = require("gulp-posthtml");
const rename = require("gulp-rename"); // Подключаем библиотеку для переименования файлов

const server = require("browser-sync").create(); // Подключаем Browser Sync
const del = require("del"); // Подключаем библиотеку для удаления файлов и папок

const sourcemaps = require('gulp-sourcemaps');
const mqpacker = require("css-mqpacker");
const sortCSSmq = require('sort-css-media-queries');

const fileinclude = require("gulp-file-include");


//
gulp.task("clean", function () {
    return del("build");
});


gulp.task("copy", function () {
    return gulp.src([
        "src/fonts/**/*.{woff,woff2}",
        "src/img/**",
        "src/js/**",
        "src/index.html"
    ], {
        base: "src"
    })
      .pipe(gulp.dest("build"));
});


gulp.task("css", function () {
    return gulp.src("src/less/style.less")
      .pipe(sourcemaps.init())
      .pipe(plumber())
      .pipe(less())
      .pipe(postcss([
          autoprefixer({}),
          mqpacker({
              sort: sortCSSmq
          })
      ]))
      .pipe(gulp.dest("src/css"))
      .pipe(gulp.dest("build/css"))
      .pipe(minifycss())
      .pipe(sourcemaps.write('.'))
      .pipe(rename("style.min.css"))
      .pipe(gulp.dest("build/css"))
      .pipe(server.stream());
});


gulp.task("html", function () {
    gulp.src("src/*.html")
      .pipe(posthtml([
          include()
      ]))
      .pipe(gulp.dest("build"))
      .pipe(server.stream());
});


gulp.task("fileinclude", function () {
    return gulp.src("src/*_build.html")
      .pipe(fileinclude({
          prefix: "@@",
          basepath: "@file"
      }))
      .pipe(rename(function (path) {
          path.basename = path.basename.replace("_build", "");
      }))
      .pipe(gulp.dest("src/"))
      .pipe(server.reload({stream: true}));
});


gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
));

gulp.task("server", function () {
    server.init({
        server: "build/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });


    gulp.watch("src/less/**/*.less", gulp.series("css")).on("change", server.reload);
    gulp.watch("src/*_build.html", gulp.parallel("fileinclude")).on("change", server.reload); // наблюдаем и исполняем
    gulp.watch("src/html/*.html", gulp.parallel("fileinclude")).on("change", server.reload); // наблюдаем и исполняем
    gulp.watch("src/*.html", gulp.series("build")).on("change", server.reload);
    gulp.watch("src/js/*.js").on("change", server.reload);
});


gulp.task("default", gulp.series("build", "server")); // запускаем командой gulp ("default")