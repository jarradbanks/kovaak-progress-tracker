import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import configuration from "./modules/configuration";

export default new Vuex.Store({
  modules: {
    configuration
  }
});
