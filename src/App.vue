<template>
  <v-app>
    <v-row no-gutters style="max-height: 48px;" class="appbar">
      <v-col cols="8">
        <v-tabs style="background: transparent;">
          <v-tab @click="$router.push('/statistics')" class="appbar-items"
            >Statistics</v-tab
          >
          <v-tab @click="$router.push('/routines')" class="appbar-items"
            >Routines</v-tab
          >
        </v-tabs>
      </v-col>
      <v-col cols="4" class="text-right py-1 pr-1 appbar-items">
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
      </v-col>
    </v-row>

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
    },
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
            path: "/statistics",
          });
        } else {
          if (this.$router.path != "/") {
            this.$router.push({
              path: "/",
            });
          }
        }
      });
    },
  },
};
</script>

<style scoped>
>>> .theme--dark.v-tabs > .v-tabs-bar {
  background-color: transparent !important;
}
</style>

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

.theme--dark.v-application > ::-webkit-scrollbar-track {
  background: #202020;
}

.theme--light.v-application > ::-webkit-scrollbar-track {
  background: #fafafa;
}
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 0px rgba(0, 0, 0, 0.3);
}
::-webkit-scrollbar {
  width: 12px;
  background-color: var(v--background-base);
}

.theme--dark.v-application > ::-webkit-scrollbar-thumb {
  background: #101010;
}

.theme--light.v-application > ::-webkit-scrollbar-thumb {
  background: #eeeeee;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
.v-toolbar__content {
  padding: 0px !important;
  height: 48px;
}
.capitalize {
  text-transform: capitalize;
}
</style>
