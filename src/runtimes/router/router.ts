import Vue = require('vue');
import VueRouter = require('vue-router');

Vue.use(VueRouter);

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
