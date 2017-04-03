import Vue = require('vue');
import VueRouter = require('vue-router');

Vue.use(VueRouter);

// We are using Webpack code splitting here so that each route's associated
// component code is loaded on-demand only when the route is visited.
// It's actually not really necessary for a small project of this size but
// the goal is to demonstrate how to do it.
//
// Note that the dynamic import syntax should actually be just `import()`
// but buble/acorn doesn't support parsing that syntax until it's stage 4
// so we use the old System.import here instead.
//
// If using Babel, `import()` can be supported via
// babel-plugin-syntax-dynamic-import.

const createListView = name => (resolve) => {
  require.async('views/createListView', function (m) {
    resolve(m.createListView(name));
  });
};

export default new VueRouter({
  mode: 'hash',
  scrollBehavior: (to, from, savedPosition) => ({ x: 0, y: 0 }),
  routes: [
    {
      path: '/top/:page(\\d+)?',
      component: createListView('top')
    },
    {
      path: '/new/:page(\\d+)?',
      component: createListView('new') },
    {
      path: '/show/:page(\\d+)?',
      component: createListView('show') },
    {
      path: '/ask/:page(\\d+)?',
      component: createListView('ask') },
    {
      path: '/job/:page(\\d+)?',
      component: createListView('job') },
    {
      path: '/item/:id(\\d+)',
      component: function (resolve) {
        require.async('views/item/item.vue', resolve);
      }
    },
    {
      path: '/user/:id',
      component: function (resolve) {
        require.async('views/user/user.vue', resolve);
      }
    },
    {
      path: '*', redirect: '/top' }
  ]
});
