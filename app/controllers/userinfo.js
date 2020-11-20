const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Author = mongoose.model('Author')

module.exports = (app, passport) => {
  // 权限验证，交给passport如果是则进入，不是则退出到首页  在 express里面
  router.get('/userinfo', passport.authenticateMiddleware(), (req, res, next) => {
    // render默认在views下找
    res.render('admin/userinfo', { //页面所在路径
      title: '用户登入',
      user: req.user
    });
  });
  // 把数据提交有两种方式：异步或者表单
  router.post('/modifyInfo', passport.authenticateMiddleware(), async (req, res, next) => {
    const result = await Author.updateOne({
      _id: req.user._id
    }, {
      nickname: req.body.nickname,
      email: req.body.email,
      intro: req.body.intro
    })
    if (result.nModified) {
      res.redirect('/admin/userinfo')
    }
  })

  app.use('/admin', router); //访问路径是admin
};
