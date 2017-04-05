/// 将 expect 暴露到全局中, 不用每个 spec 都去 import

import chai = require('chai');
declare global{
  let expect: typeof chai.expect;
}
