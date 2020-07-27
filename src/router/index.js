import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/configuration"
  },
  {
    path: "/configuration",
    name: "Configuration",

    component: () => import("../views/Configuration.vue")
  },
  {
    path: "/dashboard",
    name: "Dashboard",

    component: () => import("../views/Dashboard.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
