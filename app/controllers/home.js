const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')

const async = require('async')
let Article = mongoose.model('Article')
let Comments = mongoose.model('Comments')


// const mongoose = require('mongoose');
// const Article = mongoose.model('Article');

module.exports = (app) => {
  app.use('/blog', router);
};

// 分页  三个重要的参数：总记录数，每页显示的记录数(总页数)
// 当然用户可以传递页码过来，mongoose中如何实现指定页码的记录数
// mongoose中实现指定页码的记录，两个重要方法：limit(),skip()
// 步骤：1.查询总的记录数   2.根据每页显示的记录数实现分页  3.添加每篇博客的评论数量  4.前端渲染显示
// 注意：mongoose中的查询属于异步，因此这里使用到第三方框架 async (npm i async)
// 在异步框架中，有一个重要的将异步方法按指定顺序执行并传递参数的方法：waterfall() 将回调传给下一个，会产生循环反馈

// 页码使用的是restful风格进行传递，/blog/index/1，通过req.params.page去获取传递过来的参数
// 当然可以用传统的字符串拼接：/blog/index?page=1,通过req.query.page去获取传递过来的页码
router.get('/index/:page?', (req, res, next) => {
  // 分页
  let pages = 6; // 每页显示的记录数
  let page = Number.parseInt(req.params.page || 1);

  async.waterfall([
    function (callback) {
      Article.estimatedDocumentCount().then(totalCount => callback(null, totalCount));
    },
    function (totalCount, callback) {
      let totalPage = Math.ceil(totalCount / pages);

      if (page < 1) {
        page = 1;
      }

      if (page > totalPage) {
        page = totalPage;
      }

      Article.find() // 默认查询 出来的是mongoose对象
        .sort({
          publishTime: -1
        })
        .skip((page - 1) * pages)
        .limit(pages)
        .populate('author')
        .populate('category')
        .lean() // 将查询的mongoose对象变成普通对象
        .exec((err, articles) => {
          if (err) {
            return next(err);
          }
          callback(null, articles, totalPage, page);
        });
    }
  ], async function (err, articles, totalPage, page) {
    let newArticles = await Promise.all(articles.map(async article => {
      article.commentCount = await Comments.countDocuments({
        posts: article._id
      });
      return article;
    }));
    if (err) {
      return next(err);
    }
    // render默认在views下找
    res.render('blog/index', { //页面所在路径
      title: '个人博客',
      articles: newArticles,
      totalPage: totalPage,
      page: page,
      user: req.user
    });
  });
})
