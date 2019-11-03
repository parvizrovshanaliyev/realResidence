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

// Static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "dist"
        }
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
        .pipe(sass({
            outputStyle: 'nested',
            precision: 10,
            includePaths: ['.']
        }).on('error', sass.logError))
        .pipe(minifyCSS())
        .pipe(autoprefixer())
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});


gulp.task('js', () => {
    return gulp.src('src/js/**/*.js')
        .pipe(concat('app.min.js'))
        .pipe(minifyJS())
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream());
});

gulp.task('html', () => {
    gulp.src('src/**/*.html')
        // .pipe(useref())
        // .pipe(minifyHTML({
        //     collapseWhitespace: true,
        //     removeComments: true
        // }))
        .pipe(gulp.dest('dist'))
        // .pipe(browserSync.stream());
        gulp.watch('src/**/*.html').on("change",browserSync.reload);
});

gulp.task('img', () => {
    gulp.src('src/img/**/*')
        .pipe(minifyImg())
        .pipe(gulp.dest('dist/img'));
});



gulp.task('lib',() => {
    
    gulp.src('./src/lib/jquery/dist/jquery.min.js')
    .pipe(gulp.dest('./dist/lib/jquery/dist'))

    gulp.src('./src/lib/normalize.css/normalize.css')
    .pipe(gulp.dest('./dist/lib/normalize.css'))
});

gulp.task('fonts',() => {
    return gulp.src('./src/fonts/*.{eot,svg,ttf,woff,woff2}')
           .pipe(gulp.dest('./dist/fonts'))
});

gulp.task('delete', () => del(['dist/css', 'dist/js', 'dist/img', 'dist/**/*.html']));

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
        'bower',
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