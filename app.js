const express = require('express');
const config = require('./config/config');
const glob = require('glob');
const mongoose = require('mongoose');

mongoose.connect(config.db, {
  useNewUrlParser: true
});
const db = mongoose.connection;
db.on('error', () => {
  throw new Error('unable to connect to database at' + config.db);
});

// 遍历所有model
const models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  // 判断
  if (!model.includes('author')) {
    require(model);
  }
});
const app = express();

module.exports = require('./config/express')(app, config);

app.listen(config.port, () => {
  console.log('Express server listening on port ' + config.port);
});
