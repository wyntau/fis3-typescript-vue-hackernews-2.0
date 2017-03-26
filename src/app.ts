
import Vue = require('vue');
import { sync } from 'vuex-router-sync';

// register global utility filters.
import * as filters from 'runtimes/filters/filters';

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

import router from 'runtimes/router/router';
import store from 'runtimes/store/store';

import App from 'runtimes/views/app.vue';

// sync the router with the vuex store.
// this registers `store.state.route`
sync(store, router);

const app = new Vue({
  router,
  store,
  ...App
}).$mount('#app');

/// export our app
export default app;
