require('es6-promise').polyfill();

if(typeof __DEBUG === 'undefined' || __DEBUG === true){
  require.async([
    'vconsole'
  ], function(){
    require.async(['app']);
  });
}else{
  require.async(['app']);
}
