const express = require('express');
const glob = require('glob');

const favicon = require('serve-favicon');
const logger = require('morgan');
const session = require('express-session')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const compress = require('compression');
const methodOverride = require('method-override');
const path = require('path')
const moment = require('moment')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const flash = require('connect-flash')

module.exports = (app, config) => {

  // 导入author
  const Author = require(config.root + '/app/models/author.js')
  const env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  app.set('views', config.root + '/app/views');
  app.set('view engine', 'pug');
  // 将moment变成全局的本地变量，方便使用
  app.use((req, res, next) => {
    app.locals.moment = moment
    next()
  })


  app.use(favicon(config.root + '/public/img/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json({limit:'10000kb'}));
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(session({
    secret: 'hands by hands key',
    resave: false,
    saveUninitialized: true
  }))

  app.use(cookieParser());
  app.use(passport.initialize());
  app.use(flash());
  app.use(passport.session());
  app.use(compress());
  app.use(express.static(config.root + '/public'));

  // 将下载的第三方库添加到静态资源 路径当中，方便访问
  app.use('/jquery', express.static(config.root + '/node_modules/jquery/dist'))
  app.use('/fontawesome', express.static(config.root + '/node_modules/@fortawesome/fontawesome-free'))
  app.use('/bootstrap', express.static(config.root + '/node_modules/bootstrap/dist'))
  app.use('/validation', express.static(config.root + '/node_modules/jquery-validation/dist'))
  app.use('/cropper', express.static(config.root + '/node_modules/cropperjs/dist'))
  app.use('/jquery-cropper', express.static(config.root + '/node_modules/jquery-cropper/dist'))

  app.use(methodOverride());

  // passport config    用passport对登入非用户进行限制

  passport.use(new LocalStrategy(Author.authenticate()));
  passport.serializeUser(Author.serializeUser());
  passport.deserializeUser(Author.deserializeUser());

  // 封装一个中间件函数到passport中，可以需要拦截未验证的用户的一个请求
  passport.authenticateMiddleware = function () { 
    return function (req,res,next) { 
      if(req.isAuthenticated()){
        return next();
      }
      res.redirect('/admin/login')
     }
   }

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach((controller) => {
    require(controller)(app, passport);
  });

  app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
      title: 'error'
    });
  });

  return app;
};
