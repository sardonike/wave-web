var gulp = require('gulp'),
    pngquant = require('imagemin-pngquant'),
    del = require('del'),
    $ = require('gulp-load-plugins')();

var app = {
    "name": "ridewaveApp",
    "home": "app/",
    "index": "app/index.html",
    "scripts": {
        "angularGlob": "app/modules/**/*.js",
        "dist": "dist/js/*.js"
    },
    "css": {
        "sass": "app/css/scss/app.scss",
        "out": "app/css",
        "glob": "app/css/scss/**/*.scss",
        "dist": "dist/css/*.css"
    },
    "fonts": {
        "vendorGlob": "app/vendor/**/fonts/*.*",
        "filter": "**/*.{eot,svg,ttf,woff,woff2}"
    },
    "images": {
        "sourceGlob": "app/img/**/*"
    },
    "bower": "app/vendor",
    "templates": {
        "source": "app/modules/**/*.html",
        "outPath": "app/js/",
        "name": "templates.js"
    },
    "vendor": {
        "fonts": "dist/fonts"
    },
    "dist": {
        "path": "dist",
        "fonts": "dist/fonts",
        "images": "dist/img",
        "php": "dist/php"
    },
    "staticFiles": [
        "./app/css/AdminLTE.css",
        "./app/css/skins/*",
        "./app/js/adminlte.js",
        "./app/fonts/quicksand/*",
        "./app/.htaccess",
        "./app/send.php",
        "php/**/*"
    ]
};

gulp.task('useref', ['cleanDist', 'wiredep'], function () {
    var jsFilter = $.filter("**/*.js", { restore: true });
    var cssFilter = $.filter("**/*.css", { restore: true });
    var indexHtmlFilter = $.filter(['**/*', '!**/index.html'], { restore: true });

    return gulp.src(app.index)
        .pipe($.useref({searchPath: app.home}))
        .pipe(jsFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe($.cleanCss())
        .pipe(cssFilter.restore)
        .pipe(indexHtmlFilter)
        .pipe($.rev())
        .pipe(indexHtmlFilter.restore)
        .pipe($.revReplace())
        .pipe(gulp.dest(app.dist.path));
});

gulp.task('cleanDist', function(){
   return del([app.scripts.dist, app.css.dist]);
});

gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    return gulp.src(app.index)
        .pipe($.inject(gulp.src(app.scripts.angularGlob).pipe($.angularFilesort()), {
            relative: true,
            addRootSlash: true
        }))
        .pipe(wiredep({
            directory: app.bower,
            exclude: ['modernizr'],
            fileTypes: {
                html: {
                    replace: {
                        js: '<script src="/{{filePath}}"></script>',
                        css: '<link rel="stylesheet" href="/{{filePath}}" />'
                    }
                }
            }

        }))
        .pipe(gulp.dest(app.home));
});

gulp.task('htmlTemplates', function () {
    return gulp.src(app.templates.source)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.ngHtml2js({
            moduleName: app.name,
            prefix: "modules/"
        }))
        .pipe($.concat(app.templates.name))
        .pipe($.uglify())
        .pipe(gulp.dest(app.templates.outPath));
});

gulp.task('css', function () {
    return gulp.src(app.css.sass)
        .pipe($.sass())
        .pipe($.autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
        }))
        .pipe(gulp.dest(app.css.out))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return gulp.src(app.fonts.vendorGlob)
        .pipe($.filter(app.fonts.filter))
        .pipe($.flatten())
        .pipe(gulp.dest(app.dist.fonts))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src(app.images.sourceGlob)
        .pipe($.imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(app.dist.images))
        .pipe($.size());
});

gulp.task('copyStaticFiles', function() {
    gulp.src(app.staticFiles, {base: './app'})
        .pipe(gulp.dest(app.dist.path));
    gulp.src(['./php/**/*'])
        .pipe(gulp.dest(app.dist.php));
});

gulp.task('watch', ['css', 'fonts', 'images', 'htmlTemplates', 'wiredep'], function() {

    $.watch(app.css.glob, function(){ gulp.start('css'); });
    $.watch(app.templates.source, function(){ gulp.start('htmlTemplates'); });
    $.watch(app.scripts.angularGlob, function(){ gulp.start('wiredep'); });
    $.watch(app.images.sourceGlob, function(){ gulp.start('images'); });

});

gulp.task('build', ['css', 'htmlTemplates', 'useref']);
gulp.task('build:prod', ['build', 'images', 'fonts', 'useref', 'copyStaticFiles']);