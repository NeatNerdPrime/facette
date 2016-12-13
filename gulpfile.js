"use strict";

var fs = require('fs'),
    gulp = require('gulp'),
    chmod = require('gulp-chmod'),
    concat = require('gulp-concat'),
    environments = require('gulp-environments'),
    footer = require('gulp-footer'),
    header = require('gulp-header'),
    htmlmin = require('gulp-htmlmin'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    jsonminify = require('gulp-jsonminify'),
    myth = require('gulp-myth'),
    rename = require('gulp-rename'),
    templatecache = require('gulp-angular-templatecache'),
    translateextract = require('gulp-angular-translate-extract'),
    uglify = require('gulp-uglify'),
    uglifycss = require('gulp-uglifycss'),
    vendor = require('gulp-concat-vendor');

var config = {
    pkg: JSON.parse(fs.readFileSync('./bower.json')),
    banner:
        '/*!\n' +
        ' * <%= pkg.name %> - <%= pkg.description %>\n' +
        ' * Website: <%= pkg.homepage %>\n' +
        ' * License: <%= pkg.license %>\n' +
        ' */\n',
    build_dir: process.env.BUILD_DIR,
    files: {
        script: [
            'src/assets/facette/js/extend.js',
            'src/assets/facette/js/chart/chart.js',
            'src/assets/facette/js/chart/config.js',
            'src/assets/facette/js/chart/data.js',
            'src/assets/facette/js/chart/svg.js',
            'src/assets/facette/js/chart/rect.js',
            'src/assets/facette/js/chart/main.js',
            'src/assets/facette/js/chart/title.js',
            'src/assets/facette/js/chart/axis.js',
            'src/assets/facette/js/chart/area.js',
            'src/assets/facette/js/chart/series.js',
            'src/assets/facette/js/chart/tooltip.js',
            'src/assets/facette/js/chart/legend.js',
            'src/assets/facette/js/chart/utils.js',
            'src/assets/facette/js/define.js',
            'src/assets/facette/js/utils.js',
            'src/assets/facette/js/app.js',
            'src/assets/facette/js/api.js',
            'src/assets/facette/js/storage.js',
            'src/assets/facette/js/ui/*.js',
            'src/assets/facette/js/error.js',
            'src/assets/facette/js/browse/*.js',
            'src/assets/facette/js/show/*.js',
            'src/assets/facette/js/admin/*.js'
        ],
        style: [
            'src/assets/facette/css/font.css',
            'src/assets/facette/css/common.css',
            'src/assets/facette/css/dialog.css',
            'src/assets/facette/css/header.css',
            'src/assets/facette/css/sidebar.css',
            'src/assets/facette/css/content.css',
            'src/assets/facette/css/tab.css',
            'src/assets/facette/css/message.css',
            'src/assets/facette/css/column.css',
            'src/assets/facette/css/list.css',
            'src/assets/facette/css/pagination.css',
            'src/assets/facette/css/sortable.css',
            'src/assets/facette/css/form.css',
            'src/assets/facette/css/menu.css',
            'src/assets/facette/css/graph.css'
        ],
        style_print: [
            'src/assets/facette/css/print.css'
        ],
        html: [
            'src/assets/facette/html/ui/*.html',
            'src/assets/facette/html/error/*.html',
            'src/assets/facette/html/admin/*.html',
            'src/assets/facette/html/browse/*.html',
            'src/assets/facette/html/common/*.html',
            'src/assets/facette/html/show/*.html'
        ],
        vendor: {
            js: [
                'vendor/bower_components/jquery/dist/jquery.min.js',
                'vendor/bower_components/messageformat/messageformat.js',
                'vendor/bower_components/moment/min/moment.min.js',
                'vendor/bower_components/d3/d3.js',
                'vendor/bower_components/angular/angular.min.js',
                'vendor/bower_components/angular-route/angular-route.min.js',
                'vendor/bower_components/angular-resource/angular-resource.min.js',
                'vendor/bower_components/angular-sanitize/angular-sanitize.min.js',
                'vendor/bower_components/angular-translate/angular-translate.min.js',
                'vendor/bower_components/angular-translate-loader-static-files/' +
                    'angular-translate-loader-static-files.min.js',
                'vendor/bower_components/angular-translate-interpolation-messageformat/' +
                    'angular-translate-interpolation-messageformat.min.js',
                'vendor/bower_components/angular-inview/angular-inview.js',
                'vendor/bower_components/angular_page_visibility/dist/page_visibility.min.js',
                'vendor/bower_components/ng-dialog/js/ngDialog.min.js',
                'vendor/bower_components/angular-ui-select/dist/select.min.js',
                'vendor/bower_components/angular-ui-tree/dist/angular-ui-tree.min.js',
                'vendor/bower_components/angular-paging/dist/paging.min.js',
                'vendor/bower_components/ng-sortable/dist/ng-sortable.min.js',
                'vendor/bower_components/angucomplete-alt/dist/angucomplete-alt.min.js',
                'vendor/bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js',
                'vendor/bower_components/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
                'vendor/bower_components/angular-date-time-input/src/dateTimeInput.js'
            ],
            css: [
                'vendor/bower_components/font-awesome/css/font-awesome.min.css'
            ],
            fonts: [
                'vendor/bower_components/font-awesome/fonts/fontawesome-webfont.eot',
                'vendor/bower_components/font-awesome/fonts/fontawesome-webfont.svg',
                'vendor/bower_components/font-awesome/fonts/fontawesome-webfont.ttf',
                'vendor/bower_components/font-awesome/fonts/fontawesome-webfont.woff',
                'vendor/bower_components/font-awesome/fonts/fontawesome-webfont.woff2',
                'vendor/bower_components/roboto-googlefont/Roboto-Light.ttf',
                'vendor/bower_components/roboto-googlefont/Roboto-Medium.ttf',
                'vendor/bower_components/roboto-googlefont/Roboto-Regular.ttf'
            ],
            images: [
                'src/assets/facette/images/*'
            ]
        }
    }
};

if (!config.build_dir) {
    console.error("Error: missing 'BUILD_DIR' environment variable");
    process.exit(1);
}

gulp.task('default', [
    'build'
]);

gulp.task('build', [
    'build-script',
    'copy-script',
    'build-style',
    'copy-style',
    'build-html'
]);

gulp.task('lint', [
    'lint-script'
]);

gulp.task('build-script', ['build-html'], function() {
    gulp.src(config.files.script.concat([config.build_dir + '/tmp/templates.js']))
        .pipe(concat('facette.js'))
        .pipe(header(config.banner + '\n(function() {\n\n"use strict";\n\n', {pkg: config.pkg}))
        .pipe(footer('\n}());\n'))
        .pipe(environments.production(uglify({mangle: false, preserveComments: 'license'})))
        .pipe(gulp.dest(config.build_dir + '/assets/js'));

    gulp.src('src/assets/facette/js/locales/*.json')
        .pipe(jsonminify())
        .pipe(chmod(644))
        .pipe(gulp.dest(config.build_dir + '/assets/js/locales'));
});

gulp.task('copy-script', function() {
    gulp.src(config.files.vendor.js)
        .pipe(vendor('vendor.js'))
        .pipe(environments.production(uglify({preserveComments: 'license'})))
        .pipe(chmod(644))
        .pipe(gulp.dest(config.build_dir + '/assets/js'));
});

gulp.task('lint-script', function() {
    gulp.src(config.files.script)
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(jscs())
        .pipe(jscs.reporter());
});

gulp.task('build-style', function() {
    gulp.src(config.files.style)
        .pipe(concat('style.css'))
        .pipe(header(config.banner + '\n', {pkg: config.pkg}))
        .pipe(myth())
        .pipe(chmod(644))
        .pipe(gulp.dest(config.build_dir + '/assets/css'))
        .pipe(environments.production(uglifycss()))
        .pipe(rename({extname: '.min.css'}))
        .pipe(chmod(644))
        .pipe(gulp.dest(config.build_dir + '/assets/css'));

    gulp.src(config.files.style_print)
        .pipe(concat('style.print.css'))
        .pipe(header(config.banner + '\n', {pkg: config.pkg}))
        .pipe(myth())
        .pipe(chmod(644))
        .pipe(gulp.dest(config.build_dir + '/assets/css'))
        .pipe(environments.production(uglifycss()))
        .pipe(rename({extname: '.min.css'}))
        .pipe(chmod(644))
        .pipe(gulp.dest(config.build_dir + '/assets/css'));
});

gulp.task('copy-style', function() {
    gulp.src(config.files.vendor.css)
        .pipe(chmod(644))
        .pipe(gulp.dest(config.build_dir + '/assets/css'));

    gulp.src(config.files.vendor.fonts)
        .pipe(chmod(644))
        .pipe(gulp.dest(config.build_dir + '/assets/fonts'));

    gulp.src(config.files.vendor.images)
        .pipe(chmod(644))
        .pipe(gulp.dest(config.build_dir + '/assets/images'));
});

gulp.task('build-html', function() {
    gulp.src([
        'src/assets/facette/html/index.html'
    ])
        .pipe(chmod(644))
        .pipe(gulp.dest(config.build_dir + '/assets/html'));

    return gulp.src(config.files.html)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(templatecache({
            base: process.cwd(),
            module: 'facette',
            transformUrl: function(url) {
                url = url.substr(24);
                if (url.indexOf('ui/') === 0) {
                    url = url.substr(3);
                }

                return 'templates/' + url;
            }
        }))
        .pipe(gulp.dest(config.build_dir + '/tmp'));
});

gulp.task('update-locale', function() {
    gulp.src(config.files.script.concat([
        'src/assets/facette/html/index.html',
        config.files.html
    ]))
        .pipe(translateextract({
            lang: ['en'],
            suffix: '.json',
            dest: 'src/assets/facette/js/locales',
            nullEmpty: true,
            safeMode: true,
            stringifyOptions: true
        }))
        .pipe(gulp.dest('src/assets/facette/js'));
});
