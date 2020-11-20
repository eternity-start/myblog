const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const plumber = require('gulp-plumber');
const livereload = require('gulp-livereload');
const sass = require('gulp-sass');
const named = require('vinyl-named')
const uglify = require('gulp-uglify-es').default
const compiler = require('webpack') //验证码
const webpack = require('webpack-stream') //验证码
const glob = require('glob');
const path = require('path') //需要替换引用path

require('babel-polyfill')

// ---------------------------------------css编译
let cssTasks = new Map()
// 读取src/admin/*.scss与src/blog/*.scss文件 => public/admin/*.css  public/blog/*.css
let cssFiles = glob.sync(__dirname + '/src/css/+(include|admin|blog)/*.scss')
// 遍历  

cssFiles.forEach(cssFile => {
  // 将src替换成public
  let dest = path.dirname(cssFile.replace('src', 'public'))

  // 给每个文件添加task ,当某个文件修改时，不至于重新编译所有文件
  cssTasks.set(cssFile, function (cb) { //cb callback
    gulp.src(cssFile)
      .pipe(plumber())
      .pipe(sass({
        outputStyle: 'compressed'
      }))
      .pipe(gulp.dest(dest))
      .pipe(livereload());
    cb()
  })
})

function css(cb) {
  gulp.series(...cssTasks.values())
  cb()
}

// ------------------------------------js编译
let jsTasks = new Map()
// 读取src/admin/*.scss与src/blog/*.scss文件 => public/admin/*.css  public/blog/*.css
let jsFiles = glob.sync(__dirname + '/src/js/+(admin|blog)/*.js')
jsFiles.forEach(jsFile => {
  let dest = path.dirname(jsFile.replace('src', 'public'))
  jsTasks.set(jsFile, function (cb) { //cb callback
    gulp.src(jsFile)
      .pipe(plumber())
      .pipe(named())
      .pipe(webpack({
        mode: 'development',
        watch: true,
        module: {
          rules: [{
            test: /\.js$/,
            exclude: path.resolve(__dirname, 'node_modules/'),
            use: {
              loader: 'babel-loader',
              options: {
                presets: ["@babel/preset-env"],
                compact: false,
                plugins: ["@babel/plugin-transform-runtime"]
              }
            }
          }]
        }
      }, compiler))
      .pipe(uglify())
      .pipe(gulp.dest(dest))
      .pipe(livereload());
    cb()
  })
})

function js(cb) {
  gulp.series(...jsTasks.values())
  cb()
}

// -----------图片-----------------
function img(cb) {
  gulp.src('./src/img/*.*')
    .pipe(gulp.dest('./public/img'))
    .pipe(livereload())
  cb()
}


function watch(cb) {
  //gulp.watch('./src/css/*.scss', gulp.parallel(css));
  for (let [key, value] of cssTasks.entries()) {
    gulp.watch(key, gulp.parallel(value))
  }
  for (let [key, value] of jsTasks.entries()) {
    gulp.watch(key, gulp.parallel(value))
  }

  gulp.watch('./src/img/*.*', gulp.parallel(img))

  cb()
}


function develop(cb) {
  livereload.listen();
  nodemon({
    script: 'app.js',
    ext: 'js coffee pug ',
    stdout: false
  }).on('readable', function () {
    this.stdout.on('data', (chunk) => {
      if (/^Express server listening on port/.test(chunk)) {
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
  cb()
}
exports.default = gulp.series(css, js, img, develop, watch);
