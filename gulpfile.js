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
const ts = require('gulp-typescript');
const del = require('del');

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
        dir: 'dist'
    }
};

gulp.task('copy', [], () => {
    return gulp.src(paths.static.files)
        .pipe(gulp.dest(paths.dist.dir));
});

gulp.task('build', ['copy'], () => {
    return gulp.src(paths.ts.src.files)
        .pipe(ts())
        .pipe(gulp.dest(paths.dist.dir));
});

gulp.task('clean', [], () => {
    return del(paths.dist.dir);
});