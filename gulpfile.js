"use strict";

const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const sourcemaps = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const rollup = require("rollup");
const resolve = require("@rollup/plugin-node-resolve");
const babel = require("@rollup/plugin-babel");
const { default: commonjs } = require("@rollup/plugin-commonjs");

// settings.
const settings = {
  browserSync: {
    init: {
      open: false,
      server: {
        baseDir: "public/",
      },
    },
    watch: ["public/**/*.html", "public/**/*.png", "public/**/*.jpg"],
  },
  css: {
    src: ["source/src/scss/**/*.scss"],
    dest: "public/assets/css",
    sourceRoot: "../../source/src/scss",
    build: ["public/assets/css/style.css"],
  },
  js: {
    input: "source/src/js/index.js",
    watch: "source/src/js/**/*.js",
    bundle: "public/assets/js/script.js",
  },
};

// dev.
const dev = {
  // start browsersync
  init: function (done) {
    // BrowserSync serve
    browserSync.init(settings.browserSync.init);
    done();
  },

  // reload browsersync
  reload: function (done) {
    // BrowserSync reload
    browserSync.reload();
    done();
  },

  // compile sass
  sass: function () {
    return gulp
      .src(settings.css.src)
      .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
      .pipe(
        sourcemaps.write(".", {
          includeContent: false,
          sourceRoot: settings.css.sourceRoot,
        })
      )
      .pipe(gulp.dest(settings.css.dest))
      .pipe(browserSync.stream());
  },

  // concat frontend js
  js: async function () {
    const bundle = await rollup.rollup({
      input: settings.js.input,
      plugins: [
        resolve(),
        commonjs(),
        babel({
          babelHelpers: "bundled",
        }),
      ],
    });
    await bundle.write({
      file: settings.js.bundle,
      format: "umd",
      sourcemap: true,
    });

    return gulp.src(settings.js.input).pipe(browserSync.stream());
  },

  // watch files
  watch: function (done) {
    gulp.watch(settings.browserSync.watch, dev.reload);
    gulp.watch(settings.css.src, dev.sass);
    gulp.watch(settings.js.watch, dev.js);
    done();
  },
};

exports.default = gulp.series(dev.init, dev.sass, dev.js, dev.watch);
