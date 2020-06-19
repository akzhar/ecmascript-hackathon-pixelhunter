const del = require(`del`);
const gulp = require(`gulp`);
const sass = require(`gulp-sass`);
const plumber = require(`gulp-plumber`);
const postcss = require(`gulp-postcss`);
const autoprefixer = require(`autoprefixer`);
const server = require(`browser-sync`).create();
const minify = require(`gulp-csso`);
const rename = require(`gulp-rename`);
const imagemin = require(`gulp-imagemin`);
const svgstore = require(`gulp-svgstore`);
const rollup = require(`gulp-better-rollup`);
const sourcemaps = require(`gulp-sourcemaps`);
const mocha = require(`gulp-mocha`);
const commonjs = require(`rollup-plugin-commonjs`);

gulp.task(`test`, function () {
  return gulp
  .src([`src/js/**/*.test.js`])
    .pipe(rollup({
      plugins: [
        commonjs() // Сообщает Rollup, что модули можно загружать из node_modules
      ]}, `cjs`)) // Выходной формат тестов — `CommonJS` модуль
  .pipe(gulp.dest(`docs/test`))
  .pipe(mocha({
    reporter: `spec` // Вид в котором я хочу отображать результаты тестирования
  }));
});

gulp.task(`style`, () => {
  return gulp.src(`src/sass/style.scss`).
  pipe(plumber()).
  pipe(sass()).
  pipe(postcss([
    autoprefixer({
      browsers: [
        `last 1 version`,
        `last 2 Chrome versions`,
        `last 2 Firefox versions`,
        `last 2 Opera versions`,
        `last 2 Edge versions`
      ]
    })
  ])).
  pipe(gulp.dest(`docs/css`)).
  pipe(server.stream()).
  pipe(minify()).
  pipe(rename(`style.min.css`)).
  pipe(gulp.dest(`docs/css`));
});

gulp.task(`sprite`, () => {
  return gulp.src(`src/img/sprite/*.svg`).
  pipe(svgstore({
    inlineSvg: true
  })).
  pipe(rename(`sprite.svg`)).
  pipe(gulp.dest(`docs/img`));
});

gulp.task(`scripts`, () => {
  return gulp.src(`src/js/**/*.js`).
    pipe(plumber()).
    pipe(sourcemaps.init()).
    pipe(rollup({}, `iife`)).
    pipe(sourcemaps.write(``)).
    pipe(gulp.dest(`docs/js/`));
});

gulp.task(`imagemin`, () => {
  return gulp.src(`docs/img/**/*.{jpg,png,gif}`).
    pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ])).
    pipe(gulp.dest(`docs/img`));
});

gulp.task(`copy-html`, () => {
  return gulp.src(`src/*.{html,ico}`).
    pipe(gulp.dest(`docs`)).
    pipe(server.stream());
});

gulp.task(`copy`, () => {
  return gulp.src([
    `src/fonts/**/*.{woff,woff2}`,
    `src/img/*.*`
  ], {base: `src`}).
    pipe(gulp.dest(`docs`));
});

gulp.task(`clean`, () => {
  return del(`docs`);
});

gulp.task(`reload`, (done) => {
  server.reload();
  done();
});

gulp.task(`serve`, () => {
  server.init({
    server: `./docs`,
    notify: false,
    open: true,
    port: 3502,
    ui: false
  });

  gulp.watch(`src/sass/**/*.{scss,sass}`, gulp.series(`style`, `reload`));
  gulp.watch(`src/*.html`).on(`change`, (e) => {
    if (e.type !== `deleted`) {
      gulp.series(`copy-html`);
    }
  });
  gulp.watch(`src/js/**/*.js`, gulp.series(`scripts`, `reload`));
});

gulp.task(`assemble`, gulp.series(`clean`, `copy`, `copy-html`, `style`, `sprite`, `imagemin`, `scripts`));

gulp.task(`build`, gulp.series(`assemble`, `serve`));
