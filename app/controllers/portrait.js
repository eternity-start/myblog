const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Author = mongoose.model('Author')

module.exports = (app, passport) => {
  router.get('/portrait', passport.authenticateMiddleware(), (req, res, next) => {
    // render默认在views下找
    res.render('admin/portrait', { //页面所在路径
      title: '修改头像',
      user: req.user 
    });
  });
  router.post('/updatePortrait', passport.authenticateMiddleware(), async (req, res, next) => {
    let portrait = req.body.portrait;

    let result = await Author.updateOne({
      _id: req.user._id
    }, {
      portrait: portrait
    });

    if (result.nModified) {
      res.redirect('/admin/portrait');
    }
  });

  app.use('/admin', router);
};
