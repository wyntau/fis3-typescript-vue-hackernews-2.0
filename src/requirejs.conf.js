var allTestFiles = []

// 严格规定每个单元测试文件后缀为 .spec.js, 将 .test.js 的情况去除在外.
// 因为 sinon 中有 test.js 文件
var TEST_REGEXP = /\.spec\.js$/i

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '')
                                    // 把 "dist/" 去掉, 让文件的文件名和
                                    // moduleId 对应起来, 方便使用 requirejs加载
                                   .replace('dist/', '');
    allTestFiles.push(normalizedTestModule)
  }
})

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/dist',

  // // do not have to set node_modules path.
  // paths: {
  //   'node_modules': '../node_modules'
  // },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
})
