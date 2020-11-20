(()=>{var __webpack_require__={};__webpack_require__.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(n){if("object"==typeof window)return window}}(),
/*!**********************************!*\
  !*** ./src/js/admin/bloglist.js ***!
  \**********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__.g, __webpack_require__.* */
eval('$(function () {\n  __webpack_require__.g.delBlog = function (articleId, page) {\n    var msg = \'确认删除该条博客?\';\n\n    if (confirm(msg)) {\n      window.location.href = "/admin/delBlog/".concat(articleId, "/").concat(page);\n    }\n  };\n});\n\n//# sourceURL=webpack://myblog/./src/js/admin/bloglist.js?')})();