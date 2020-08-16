"use strict";

const gulp = require("gulp"); // Подключаем Gulp
const less = require("gulp-less"); // Подключаем Less пакет
const htmlmin = require('gulp-htmlmin');
const fileinclude = require("gulp-file-include"); // Сборка шаблонов html
const minifycss = require("gulp-csso"); // CSS минификатор
const sourcemaps = require('gulp-sourcemaps'); // Карта css
const plumber = require("gulp-plumber"); // Исключение прерывания выполнения задач при ошибке
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer"); // Подключаем библиотеку для автопрефиксов
const mqpacker = require("css-mqpacker"); // Pack same CSS media query rules into one using PostCSS
const sortCSSmq = require('sort-css-media-queries'); // Sort your media-queries to the mobile-first methodology
const rename = require("gulp-rename"); // Подключаем библиотеку для переименования файлов

const babel = require("gulp-babel"); // JS
const terser = require('gulp-terser'); // compressed es6+ code

const sync = require("browser-sync").create(); // Подключаем Browser Sync
const del = require("del"); // Подключаем библиотеку для удаления файлов и папок


// Clean
const clean = () => {
  return del("build");
};
exports.clean = clean;




// HTML

const html = () => {
  gulp.src("src/index.html")
    .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true
    }))
    .pipe(gulp.dest("build/"))
    .pipe(sync.stream());
};
exports.html = html;


const fileincludehtml = () => {
  return gulp.src("src/*_build.html")
    .pipe(fileinclude({
      prefix: "@@",
      basepath: "@file"
    }))
    .pipe(rename(function (path) {
      path.basename = path.basename.replace("_build", "");
    }))
    .pipe(gulp.dest("src/"))
    .pipe(sync.reload({stream: true}));

};
exports.fileincludehtml = fileincludehtml;




//CSS
const css = () => {
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
    .pipe(sync.reload({stream: true}));
};
exports.css = css;


// Scripts
const scripts = () => {
  return gulp.src('src/scripts/index.js')
    .pipe(terser())
    .pipe(gulp.dest('build'))
    .pipe(sync.stream());
};
exports.scripts = scripts;





// Copy
const copy = () => {
  return gulp.src([
    "src/fonts/**/*.{woff,woff2}",
    "src/img/**",
    "src/scripts/**",
    "src/index.html"
  ], {
    base: "src"
  })
    .pipe(gulp.dest("build"));
};
exports.copy = copy;




// Server
const server = () => {
  sync.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
};
exports.server = server;


// Watch
const watch = () => {
  gulp.watch("src/less/**/*.less", gulp.series(css)).on("change", sync.reload);
  gulp.watch("src/*_build.html", gulp.series(fileincludehtml));
  gulp.watch("src/html/*.html", gulp.series(fileincludehtml));

  gulp.watch("src/index.html", gulp.series(html)).on("change", sync.reload);

  gulp.watch('src/scripts/**/*.js', gulp.series(scripts));
  gulp.watch([
    'src/fonts/**/*',
    'src/img/**/*',
    'src/index.html',
  ], gulp.series(copy));
};
exports.watch = watch;


// Default

exports.default = gulp.series(
  gulp.parallel(
    clean,

  ),

  css,
  copy,
  gulp.parallel(
    watch,
    server,
  ),
);