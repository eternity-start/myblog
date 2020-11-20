const express = require('express');
const router = express.Router();
var svgCaptcha = require('svg-captcha')


// const mongoose = require('mongoose');
// const Article = mongoose.model('Article');

module.exports = (app) => {
  app.use('/admin', router);
};

router.get('/captcha', (req, res, next) => {
  var captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;

  // res.type('svg')
  res.status(200).send(captcha)


});
