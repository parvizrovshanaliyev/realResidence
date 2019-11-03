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
// const cssnano = require('cssnano');

// Static server
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "dist/"
        },
        files:['dist/**/*.*']
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
    return gulp.src('src/sass/**/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'nested',
            precision: 10,
            includePaths: ['.']
        }).on('error', sass.logError))
        .pipe(minifyCSS())
        .pipe(autoprefixer())
        .pipe(concat('main.min.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});


gulp.task('js', () => {
    return gulp.src('src/js/**/*.js')
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            })
        )
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(babel())
        .pipe(include({
            extensions: 'js',
            hardFail: true
        }))
        .pipe(concat('main.min.js'))
        .pipe(minifyJS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});

gulp.task("html", () => {
    gulp
        .src("src/**/*.html")
        .pipe(
            plumber({
                errorHandler: notify.onError("Error: <%= error.message %>")
            })
        )
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

    gulp.src('./src/lib/jquery/dist/jquery.min.js')
        .pipe(gulp.dest('./dist/lib/jquery/dist'))

    gulp.src('./src/lib/normalize.css/normalize.css')
        .pipe(gulp.dest('./dist/lib/normalize.css'))
});

gulp.task('fonts', () => {
    return gulp.src('./src/fonts/*.{eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest('./dist/fonts'))
});

gulp.task('delete', () => del(['dist/css', 'dist/js', 'dist/**/*.html']));

gulp.task('watch', () => {
    gulp.watch("src/sass/**/*.scss", ['css']);
    gulp.watch("src/js/**/*.js", ['js']);
    gulp.watch("src/img/**/*", ['img']);
    gulp.watch("src/**/*.html", ['html']);
    gulp.watch("./src/fonts/*.{eot,svg,ttf,woff,woff2}", ['fonts']);
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