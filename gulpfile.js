var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var lint = require('gulp-eslint');
 
gulp.task('test', ['lint','lint-test', 'pre-test'],function () {
    return gulp.src(['./test/**/*.js'], {read: false})
        .pipe(mocha({reporter: 'spec',timeout : 5000}))
        .pipe(istanbul.writeReports({
            dir: './reports/test-coverage',
            reporters : ['html']
        }))
        .on('error', (err) => {
            console.log(err);
            process.exit(1);
        })
        .once('end', () => {
            process.exit();
        });
});

gulp.task('pre-test', function () {

    var fs = require('fs');
    var dir = './reports';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    return gulp.src(['./server/**/*.js',"!./server/opensource-lib/**/*.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});


gulp.task('lint',function() {

    return gulp.src(["./server/**/*.js","!./server/opensource-lib/**/*.js"])
        .pipe(lint({config : '.eslintrc.json'}))
        .pipe(lint.format())
        .pipe(lint.failAfterError());
});

gulp.task('lint-test', function(){
    return gulp.src(["./test/**/*.js"])
        .pipe(lint({config : '.eslintrc_test.json'}))
        .pipe(lint.format()).pipe(lint.failAfterError());;
});

gulp.task('default',['test']);

