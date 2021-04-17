import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import configuration from "./modules/configuration";
import routines from "./modules/routines";

export default new Vuex.Store({
  modules: {
    configuration,
    routines
  }
});
