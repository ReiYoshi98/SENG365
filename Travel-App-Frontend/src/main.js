import Vue from 'vue';
import App from './App.vue';
import Home from './Home.vue';
import Venues from './Venue.vue';
import Users from './User.vue';
import VueResource from 'vue-resource';
import VueRouter from 'vue-router';
import VueCookie from 'vue-cookie';
import Vuetify from 'vuetify';
// index.js or main.js
import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader

Vue.use(Vuetify);
Vue.use(VueCookie);
Vue.use(VueRouter);
Vue.use(VueResource);



Vue.http.options.emulateJSON = true;

const routes = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/venues",
    name: "venues",
    component: Venues
  },
  {
    path: "venues/:venueId",
    name: "venue",
    component: Venues
  },
  {
    path: "/users",
    component: Users
  }
];

const router = new VueRouter ({
  routes: routes,
  mode: 'history'
});

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
});
