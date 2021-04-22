<template>
  <v-app>
    <v-app-bar color="transparent" class="appbar" flat app dense>
      <v-toolbar-title class="pl-3">{{ $route.name }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="appbar-items">
        <v-btn
          icon
          @click="$router.push('/')"
          v-if="$route.path != '/configuration'"
        >
          <v-icon>settings</v-icon>
        </v-btn>
        <v-btn icon @click="minimize">
          <v-icon>minimize</v-icon>
        </v-btn>
        <v-btn icon @click="quit">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <v-main>
      <router-view :key="$route.fullPath"></router-view>
    </v-main>
  </v-app>
</template>

<script>
const { ipcRenderer } = require("electron");

export default {
  name: "App",
  mounted() {
    ipcRenderer.send("loadConfig");
    ipcRenderer.send("getScenarios"); 
    this.handleEventListeners();
  },
  computed: {
    $config() {
      return this.$store.state.configuration.data;
    }
  },
  methods: {
    /**
     * Exit application
     * @function Quit
     */
    quit() {
      ipcRenderer.send("app:quit");
    },
    /**
     * Minimize application
     * @function Minimize
     */
    minimize() {
      ipcRenderer.send("app:minimize");
    },
    /**
     * Event listeners (for when a event is emitted)
     * @function Minimize
     */
    handleEventListeners() {
      /**
       *
       * @event Scenarios#loaded
       */
      ipcRenderer.on("gotScenarios", (event, scenarios) => {
        this.$store.commit("setScenarios", scenarios);
      });

      /**
       * Set configuration in Vuex once loaded from config.json
       * @event Config#loaded
       */
      ipcRenderer.on("loadedConfig", (event, config) => {
        if (config) {
          //setConfiguration in store/modules/configuration/mutations.js
          this.$store.commit("setConfiguration", config);

          //set applications theme (light/dark) based on user settings
          this.$vuetify.theme.dark = this.$config.theme;

          this.$router.push({
            path: "/dashboard"
          });
        } else {
          if (this.$router.path != "/") {
            this.$router.push({
              path: "/"
            });
          }
        }
      });
    }
  }
};
</script>

<style>
.appbar {
  -webkit-app-region: drag;
}

.appbar-items {
  -webkit-app-region: no-drag;
}
html {
  overflow: scroll;
  overflow-x: hidden;
}
::-webkit-scrollbar {
  width: 0px; /* Remove scrollbar space */
  background: transparent; /* Optional: just make scrollbar invisible */
}
/* Optional: show position indicator in red */
::-webkit-scrollbar-thumb {
  background: #ff0000;
}
.v-toolbar__content {
  padding: 0px !important;
  height: 48px;
}
</style>
