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
    path: "/statistics",
    name: "Statistics",
    component: () => import("../views/Dashboard.vue")
  },
  {
    path: "/routines",
    name: "Routines",
    component: () => import("../views/Routines.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
