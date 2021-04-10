<template>
  <v-container fluid style="height: 100%" class="pa-6">
    <v-card color="transparent" flat style="height: 100%">
      <v-row dense>
        <v-col cols="12">
          <v-text-field
            hide-details
            :value="path"
            readonly
            outlined
            append-icon="more_horiz"
            @click:append="openFileDialog"
            label="KovaaK Installation Path"
          ></v-text-field>
        </v-col>

        <v-col cols="12">
          <v-switch
            v-model="$vuetify.theme.dark"
            :label="$vuetify.theme.dark ? 'Dark' : 'Light'"
          ></v-switch>
        </v-col>
      </v-row>

      <v-card-actions style="position: absolute; width: 100%; bottom: 0">
        <v-row dense>
          <v-col cols="6" v-if="$config">
            <v-btn
              block
              outlined
              :disabled="path.length == 0"
              height="48"
              @click="cancel"
              >Cancel</v-btn
            >
          </v-col>
          <v-col :cols="$config ? 6 : 12">
            <v-btn
              block
              outlined
              :disabled="path.length == 0"
              height="48"
              @click="save"
              >Save</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
const { ipcRenderer } = require("electron");

export default {
  data() {
    return {
      path: "",
    };
  },
  created() {
    this.handleEventListeners();

    if (this.$config) {
      this.path = this.$config.path;
    }
  },
  computed: {
    $config() {
      return this.$store.state.configuration.data;
    },
  },
  watch: {
    $config() {
      this.path = this.$config.path;
    },
  },
  methods: {
    handleEventListeners() {
      //handle folder select dialog being closed
      ipcRenderer.on("close-path-dialog", (event, path) => {
        this.path = path;
      });

      //handle config being saved
      ipcRenderer.on("saved-config", (event, config) => {
        this.$store.commit("setConfiguration", config);

        this.$router.push({
          path: "/dashboard",
        });
      });
    },
    openFileDialog() {
      ipcRenderer.send("open-path-dialog");
    },
    save() {
      ipcRenderer.send("save-config", {
        theme: this.$vuetify.theme.dark ? true : false,
        path: this.path,
      });
    },
    cancel() {
      this.$vuetify.theme.dark = this.f$config.theme;
      this.$router.push({
        path: "/dashboard",
      });
    },
  },
};
</script>

<style scoped></style>
