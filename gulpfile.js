//    Copyright 2016 Yoshi Yamaguchi
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//        http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
'use strict';

const gulp = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const watch = require('gulp-watch');
const jsmin = require('gulp-jsmin');

const paths = {
    ts: {
        dir: 'ts',
        src: {
            dir: 'ts/src',
            files: [
                './ts/src/**/*.ts',
                '!./node_modules/**'
            ]
        }
    },
    static: {
        dir: 'static',
        files: 'static/**/*'
    },
    dist: {
        dir: 'dist',
        js: {
            files: [
                './dist/**/*.js'
            ]
        }
    }
};

const config = {
    browserify: {
        opts: {
            basedir: '.',
            entries: ['./ts/src/context-menu.ts'],
            cache: {},
            packageCache: {},
            debug: false
        }
    },
    source: {
        target: 'context-menu.js'
    }
};

gulp.task('copy', [], () => {
    return gulp.src(paths.static.files)
        .pipe(gulp.dest(paths.dist.dir));
});

gulp.task('build:tsc', ['copy'], () => {
    var tsProject = ts.createProject('tsconfig.json', {
        noEmitOnError: true,
        typescript: require('typescript')
    });
    var tsResult = tsProject.src(paths.ts.src.files)
        .pipe(ts(tsProject));
    return tsResult.js.pipe(gulp.dest(paths.dist.dir));
});

gulp.task('build', ['copy'], () => {
    return browserify([], config.browserify.opts)
        .plugin(tsify)
        .bundle()
        .pipe(source(config.source.target))
        .pipe(gulp.dest(paths.dist.dir));
});

gulp.task('watch', [], () => {
    watch(paths.ts.src.files, () => {
        gulp.start('build');
    });
});

gulp.task('minify', ['build'], () => {
    gulp.src(paths.dist.js.files)
        .pipe(jsmin())
        .pipe(gulp.dest(paths.dist.dir));
});

gulp.task('clean', [], () => {
    return del(paths.dist.dir);
});

gulp.task('default', ['minify']);