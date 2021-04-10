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
    ipcRenderer.send("load-config");
    /* ipcRenderer.send("get-scenario-cache"); */
    this.handleEventListeners();
  },
  computed: {
    $config() {
      return this.$store.state.configuration.data;
    },
  },
  /*  
  watch: {
    $config() {
      console.log(this.$store.state.configuration.data);
    },
  }, 
  */
  methods: {
    quit() {
      ipcRenderer.send("app:quit");
    },
    minimize() {
      ipcRenderer.send("app:minimize");
    },
    handleEventListeners() {
      ipcRenderer.on("got-scenario-cache", (event, scenarios) => {
        this.$store.commit("setScenarios", scenarios);
      });

      ipcRenderer.on("loaded-config", (event, config) => {
        if (config) {
          this.$store.commit("setConfiguration", config);

          this.$vuetify.theme.dark = this.$config.theme;

          this.$router.push({
            path: "/dashboard",
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
