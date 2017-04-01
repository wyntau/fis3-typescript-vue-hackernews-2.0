declare module '*.vue' {
  import Vue = require('vue');
  let ComponentOptions: Vue.ComponentOptions<any>;
  export default ComponentOptions;
}
