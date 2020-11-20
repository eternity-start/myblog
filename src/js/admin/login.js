const axios = require('axios')
// 用到的是axios 异步框架ES6  验证码用到的是jquery-validation
$(function () {
  // 使用异步加载验证码 ajax，还有点击验证时实现刷新验证码功能
  function loadCaptcha() {

    axios.get('/admin/captcha?random=' + new Date().getTime())
      .then(function (response) {

        $('#captcha').attr('data-code', response.data.text).empty().append(response.data.data)
      })
      .catch(function (err) {
        console.log(err);
      })
  }
  loadCaptcha()

  // 点击刷新验证码
  $('#captcha').click(function () {
    loadCaptcha()
  });

  // 通过jquery.validator.setDefaults()中的showErrors来捕获读错消息
  $.validator.setDefaults({
    submitHandler: function () {
      axios.post('/admin/checklogin', {
        username: $('#username').val(),
        password: $('#password').val(),
        code: $('#code').val()
      }).then(function (response) {
        let errors = response.data.errors;
        // 要验证的元素
        let validatelements = new Set(['username', 'password', 'code']);
        // 显示错误消息的元素
        let errorElement = new Set();

        if (errors != 'success') {
          errors.forEach(item => {
            if (validatelements.has(item.param)) {
              item.param !== 'code' ? $(`#${item.param}`).attr({
                'data-content': item.msg
              }) && $(`#${item.param}`).popover('show') : $('#captcha').attr({
                'data-content': item.msg
              }) && $('#captcha').popover('show');

              errorElement.add(item.param);
            }
          });

          validatelements.forEach(value => {
            if (!errorElement.has(value)) {
              value != 'code' ? $(`#${value}`).popover('hide') : $('#captcha').popover('hide');
            }
          });
        } else {
          window.location.href = '/blog/index';
        }
      }).catch(function (err) {
        if (err) {
          alert('用户名与密码不正确');
        }
      });
    },
    showErrors: function (errorMap, errorList) {
      // console.log(errorList); // 错误消息、元素 + popover 在指定的元素上显示相应的错误消息
      let idMaps = new Map([
        ['username', {
          showError: false,
          errorMsg: '用户名不符合要求'
        }],
        ['password', {
          showError: false,
          errorMsg: '密码不符合要求'
        }],
        ['code', {
          showError: false,
          errorMsg: '验证码不符合要求'
        }]
      ]);

      $.each(errorList, function (index, item) {
        if (idMaps.has(item.element.id)) {
          idMaps.set(item.element.id, {
            showError: true,
            errorMsg: item.message
          });
        }
      });

      idMaps.forEach((value, key) => {
        if (value.showError) {
          key != 'code' ? $(`#${key}`).attr({
            'data-content': value.errorMsg
          }) && $(`#${key}`).popover('show') : $('#captcha').attr({
            'data-content': value.errorMsg
          }) && $('#captcha').popover('show');
        } else {
          key != 'code' ? $(`#${key}`).popover('hide') : $('#captcha').popover('hide');
        }
      });
    }
  });

  // 通过jquery.validator.addMethod()添加自定义的方法来验证用户名与密码是否满足条件\
  // 以英文开头，包含数字等条件
  $.validator.addMethod('verifyCode', function (value, element) {
    // 判断验证码是否正确
    let sessionCode = $("#captcha").attr('data-code')
    return sessionCode === value
  }, '请输入正确验证码')


  $("#loginForm").validate({
    rules: {
      username: {
        required: true,
        minlength: 6,
        maxlength: 16
      },
      password: {
        required: true,
        minlength: 6,
        maxlength: 16
      },
      code: {
        required: true,
        rangelength: [4, 4],
        verifyCode: ''
      }
    },
    messages: {
      username: {
        required: "用户名不能为空",
        minlength: '用户名长度必须大于6',
        maxlength: '用户名长度必须小于20'
      },
      password: {
        required: "密码不能为空",
        minlength: '密码长度必须大于6',
        maxlength: '密码长度必须小于16'
      },
      code: {
        required: "验证码不能为空",
        rangelength: '验证码的长度不对'
      }
    }

  })
})
