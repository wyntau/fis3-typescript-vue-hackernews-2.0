/// 直接在 spec 中 使用 import 语法, 会导致 sinon 报错, 所以使用 d.ts 文件将 sinon 暴露到全局中
/// 错误原因: sinon package.json 中的 main 文件指向的是源文件, 不是 pkg 之后的文件
/// karma-chai-sinon 中引用的是 pkg 后的文件

import Sinon = require('sinon');
declare global{
  let sinon: typeof Sinon;
}
