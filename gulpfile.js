"use strict";

const gulp = require("gulp"); // Подключаем Gulp
const less = require("gulp-less"); // Подключаем Less пакет
const fileinclude = require("gulp-file-include"); // Сборка шаблонов html
const postcss = require("gulp-postcss"); // Плагин для обработки CSS плагинами
const autoprefixer = require("autoprefixer"); // Подключаем библиотеку для автопрефиксов
const csso = require('gulp-csso');
const rename = require("gulp-rename"); // Подключаем библиотеку для переименования файлов
const plumber = require("gulp-plumber"); // Исключение прерывания выполнения задач при ошибке
const sourcemaps = require('gulp-sourcemaps'); // Карта css

const imagemin = require("gulp-imagemin"); // Минифицируем изображения
const webp = require("gulp-webp"); // Изображения в формате webp
const svgstore = require("gulp-svgstore"); // Спрайты для svg

const terser = require('gulp-terser'); // compressed es6+ code

const sync = require("browser-sync").create(); // Подключаем Browser Sync
const del = require("del"); // Подключаем библиотеку для удаления файлов и папок


// Clean
const clean = () => {
  return del("build");
};
exports.clean = clean;


// HTML
// const html = () => {
//   return gulp.src("src/**/*.html")
//     .pipe(gulp.dest("build"))
//     .pipe(sync.reload({stream: true}));
// }
// exports.html = html;


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
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer({}),
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest("src/css"))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.reload({stream: true}));
};
exports.css = css;

// JS
// const scripts = () => {
//   return gulp.src('src/js/*.js')
//     .pipe(babel({
//       presets: ['@babel/env']
//     }))
//     .pipe(terser())
//     .pipe(uglify())
//     .pipe(gulp.dest('build/js'))
//     .pipe(sync.stream());
// };
// exports.scripts = scripts;




// Images
const images = () => {
  return gulp.src("src/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
}
exports.images = images;

const createWebp = () => {
  return gulp.src("src/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("src/img"))
}
exports.webp = createWebp;

const sprite = () => {
  return gulp.src("src/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}
exports.sprite = sprite;




// Copy
const copy = () => {
  return gulp.src([
    "src/fonts/**/*.{woff,woff2}",
    "src/img/**",
    "src/js/**",
    "src/*.ico",
    "src/index.html"
  ], {
    base: "src"
  })
    .pipe(gulp.dest("build"));
};
exports.copy = copy;


// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}





// Watcher
const watcher = () => {
  gulp.watch("src/less/**/*.less", gulp.series(css)).on("change", sync.reload);
  gulp.watch("src/html/*.html", gulp.series(fileincludehtml)).on("change", sync.reload);
  gulp.watch("src/*_build.html", gulp.series(fileincludehtml));


  // gulp.watch('src/js/**/*.js', gulp.series(scripts));
  gulp.watch([
    'src/fonts/**/*',
    'src/img/**/*',
    'src/index.html',
  ], gulp.series(copy));
};
exports.watcher = watcher;



// Default
exports.default = gulp.series(
  gulp.parallel(
    clean,
  ),
  css,
  copy,
  gulp.parallel(
    watcher,
    server,
  ),
);