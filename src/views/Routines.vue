<template>
  <v-container fluid>
    <v-toolbar flat color="transparent">
      <v-checkbox hide-details class="pl-4"></v-checkbox>
          <routine-dialog :mode="'add'"></routine-dialog>
      <v-spacer></v-spacer>

      <v-btn icon disabled class="mr-1"><v-icon>delete_sweep</v-icon></v-btn>
    </v-toolbar>
    <v-row dense style="height: 100%">
      <v-col cols="6">
        <v-card>
          <v-card-title
            ><v-checkbox
              hide-details
              class="my-0 py-0"
              label="Routine"
            ></v-checkbox>
            <v-spacer></v-spacer>
            <routine-dialog :mode="'edit'"></routine-dialog>
            <v-btn icon class="ml-2"><v-icon>delete</v-icon></v-btn>
          </v-card-title>

          <v-card-text class="pa-0">
            <v-carousel :height="250" :show-arrows="false">
              <v-carousel-item
                v-for="(item, i) in items"
                :key="i"
                reverse-transition="fade-transition"
                transition="fade-transition"
              >
                <v-divider></v-divider>
                <v-card flat height="200" min-height="200">
                  <v-container fluid class="pa-0" style="height:100%;">
                    <div style="height: 66%;" class="px-0">
                      <v-card-subtitle class="pb-0"
                        >Close Fast Strafes Invincible</v-card-subtitle
                      >
                      <v-card-text
                        >Complete scenario 10 times to progress</v-card-text
                      >
                    </div>
                    <div style="height: 33%" class="px-0">
                      <v-card-actions style="height: 100%;" class="pa-0">
                        <v-spacer></v-spacer>
                        <span
                          class="title pa-4"
                          style="background: rgba(255, 255, 255, 0.25); border: 2px solid rgba(255, 255, 255, 0.25); padding: 10px; border-top-left-radius: 25px;"
                          >10/10</span
                        >
                      </v-card-actions>
                    </div>
                  </v-container>
                </v-card>
              </v-carousel-item>
            </v-carousel>
          </v-card-text>
        </v-card>
      </v-col>
      <!--  <v-col cols="6">
        <v-card>
          <v-card-title>Test</v-card-title>
        </v-card>
      </v-col> -->
    </v-row>
  </v-container>
</template>

<script>
import RoutineDialog from "@/dialogs/RoutineDialog.vue";

export default {
  name: "Routines",
  components: {
    RoutineDialog,
  },
  data() {
    return {
      items: [
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg",
        },
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/sky.jpg",
        },
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/bird.jpg",
        },
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/planet.jpg",
        },
      ],
    };
  },
  mounted() {},
  methods: {
    addRoutine() {},
  },
};
</script>

<style lang="scss" scoped></style>
