const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const minifyImg = require('gulp-imagemin');
const minifyJS = require('gulp-uglify');
const minifyHTML = require('gulp-htmlmin');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require("gulp-notify");
const fileinclude = require('gulp-file-include');
const babel = require('gulp-babel');
const include = require('gulp-include')
const rename = require("gulp-rename");
const importCss = require('gulp-import-css');
const cnf = require('./package.json').config;
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const pipeline = require('readable-stream').pipeline;

// Static server
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "dist/"
        },
        files: ['dist/**/*.*']
    });
});

gulp.task('bower', function () {
    return gulp.src('src/index.html')
        .pipe(wiredep({
            directory: 'src/lib/'
        }))
        .pipe(gulp.dest('src'));
    // .pipe(browserSync.stream());
});

gulp.task('css', () => {
    return gulp.src(cnf.src.css)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'nested',
            precision: 10,
            includePaths: ['.']
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: cnf.browserslist,
            cascade: false
        }))
        // .pipe(minifyCSS())
        .pipe(cssnano())
        .pipe(rename({
            dirname: "",
            basename: "main",
            prefix: "",
            suffix: ".min",
            extname: ".css"
        }))
        // .pipe(concat('main.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(cnf.dist.css))

        .pipe(browserSync.stream());
});


gulp.task('js', () => {
    return gulp.src(cnf.src.js)

        .pipe(plumber())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(babel())
        .pipe(include({
            extensions: 'js',
            hardFail: true
        }))
        .pipe(rename({
            dirname: "",
            basename: "main",
            prefix: "",
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(cnf.dist.js))

        .pipe(browserSync.stream());
});

gulp.task("html", () => {
    gulp
        .src("src/**/*.html")
        .pipe(plumber())
        // .pipe(
        //     plumber({
        //         errorHandler: notify.onError("Error: <%= error.message %>")
        //     })
        // )
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        // .pipe(useref())
        // .pipe(minifyHTML({
        //     collapseWhitespace: true,
        //     removeComments: true
        // }))
        .pipe(gulp.dest("dist"));
    // .pipe(browserSync.stream());
    gulp.watch("src/**/*.html").on("change", browserSync.reload);
});

gulp.task('img', () => {
    gulp.src('src/img/**/*')
        .pipe(minifyImg())
        .pipe(gulp.dest('dist/img'));
});

gulp.task('lib', () => {

    gulp.src(cnf.lib.css)
        .pipe(plumber())
        .pipe(importCss())
        .pipe(cssnano())
        .pipe(rename({
            dirname: "",
            basename: "lib",
            prefix: "",
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(gulp.dest('dist/lib/css'))

    gulp.src(cnf.lib.js)
        .pipe(plumber())
        .pipe(babel())
        .pipe(include({
            extensions: 'js',
            hardFail: true
        }))
        .pipe(uglify())
        .pipe(rename({
            dirname: "",
            basename: "lib",
            prefix: "",
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(gulp.dest('dist/lib/js'))

        .pipe(browserSync.stream());
});

gulp.task('fonts', () => {
    return gulp.src(cnf.src.fonts)
        .pipe(gulp.dest(cnf.dist.fonts))
});

gulp.task('delete', () => del(['dist/css', 'dist/js', 'dist/**/*.html']));

gulp.task('watch', () => {
    gulp.watch("src/sass/**/*.scss", ['css']);
    gulp.watch(cnf.src.js, ['js']);
    gulp.watch("src/img/**/*", ['img']);
    gulp.watch("src/**/*.html", ['html']);
    gulp.watch(cnf.src.fonts, ['fonts']);
    gulp.watch([cnf.lib.css, cnf.lib.js], ['lib']);
});


gulp.task('default', () => {
    runSequence(
        'delete',
        'fonts',
        'lib',
        'html',
        'css',
        'js',
        'img',
        'browser-sync',
        'watch'
    );
});