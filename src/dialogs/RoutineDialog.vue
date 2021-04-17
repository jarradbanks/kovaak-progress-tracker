<template>
  <v-dialog v-model="dialog" max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>{{ mode }}</v-icon>
      </v-btn>
    </template>
    <v-card outlined>
      <v-card-title class="title capitalize"> {{ mode }} Routine </v-card-title>
      <v-divider></v-divider>

      <v-container fluid class="pa-0">
        <v-stepper v-model="step">
          <v-stepper-header>
            <v-stepper-step :complete="step > 0" step="Details">
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step :complete="step > 1" step="Scenarios">
            </v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content :step="0" class="pa-0">
              <v-card flat class="pa-4 py-0 pt-6">
                <v-form>
                  <v-text-field
                    v-model="routine.name"
                    outlined
                    dense
                    label="Name"
                  ></v-text-field>

                  <v-autocomplete
                    v-model="routine.day"
                    outlined
                    dense
                    label="Day"
                    multiple
                    :items="days"
                    :menu-props="{ maxHeight: 150 }"
                  ></v-autocomplete>
                  <v-checkbox
                    v-model="routine.repeatWeekly"
                    label="Repeat Weekly"
                    class="py-0 my-0"
                  ></v-checkbox>
                </v-form>
              </v-card>
            </v-stepper-content>
            <v-stepper-content :step="1">
              <v-card flat class="py-2">
                <v-form>
                  <v-autocomplete
                    hide-details
                    v-model="routine.scenarios"
                    outlined
                    dense
                    label="Scenarios"
                    multiple
                    :items="scenarios"
                    :menu-props="{ maxHeight: 150 }"
                    return-object
                    item-text="name"
                    item-value="name"
                  >
                    <template slot="selection">
                      ⠀
                    </template>
                  </v-autocomplete>
                </v-form>

                <v-list-item class="pl-0">
                  <v-list-item-title>Name</v-list-item-title>

                  <v-list-item-action class="mr-8">Quantity</v-list-item-action>
                  <v-list-item-action></v-list-item-action>
                  <v-list-item-action></v-list-item-action>
                  <v-list-item-action></v-list-item-action>
                </v-list-item>
                <v-divider></v-divider>
                <template v-if="routine.scenarios.length">
                  <v-list class="pa-0" style="max-height: 180px; overflow-y: auto;">
                    <template v-for="scenario in routine.scenarios">
                      <v-list-item :key="scenario.id">
                        <v-list-item-title>
                          {{ scenario.name }}
                        </v-list-item-title>

                        <v-list-item-action class="mr-6">
                          <v-dialog v-model="scenario.dialog" max-width="300">
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                small
                                outlined
                                v-bind="attrs"
                                v-on="on"
                                @click="scenario._quantity = scenario.quantity"
                                style="display: block;"
                                class="text-truncate"
                              >
                                {{ scenario.quantity }}
                              </v-btn>
                            </template>
                            <v-card outlined class="pa-0">
                              <v-card-title class="px-4"
                                >Edit Quantity <v-spacer></v-spacer
                                ><v-btn
                                  text
                                  icon
                                  @click="scenario.dialog = false"
                                  ><v-icon>clear</v-icon></v-btn
                                ></v-card-title
                              >
                              <v-divider></v-divider>
                              <v-card-text class="px-2 py-4">
                                <v-form v-model="scenario.valid">
                                  <v-text-field
                                    outlined
                                    dense
                                    type="number"
                                    :rules="quantityRules"
                                    v-model="scenario._quantity"
                                    label="Quantity"
                                  ></v-text-field>
                                </v-form>
                              </v-card-text>
                              <v-divider></v-divider>
                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                  color="primary"
                                  text
                                  @click="scenario.dialog = false"
                                  >Close</v-btn
                                >
                                <v-btn
                                  color="primary"
                                  text
                                  :disabled="!scenario.valid"
                                  @click="
                                    scenario.quantity = scenario._quantity;
                                    scenario.dialog = false;
                                  "
                                  >Save</v-btn
                                >
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                        </v-list-item-action>

                        <v-list-item-action class="mr-2">
                          <v-btn small icon @click="increaseQuantity(scenario)">
                            <v-icon>add</v-icon>
                          </v-btn>
                        </v-list-item-action>

                        <v-list-item-action class="mr-2">
                          <v-btn small icon @click="decreaseQuantity(scenario)">
                            <v-icon>remove</v-icon>
                          </v-btn>
                        </v-list-item-action>

                        <v-list-item-action>
                          <v-btn icon @click="removeScenario(scenario)">
                            <v-icon>delete</v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </template>
                  </v-list>
                </template>
                <template v-else>
                  <div class="text-center pt-3">
                    You do not have any scenarios configured :(
                  </div>
                </template>
              </v-card>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-container>

      <v-card-actions>
        <v-spacer></v-spacer>

        <template v-if="step == 1">
          <v-btn color="green" text @click="step = 0">
            Back
          </v-btn>
          <v-btn color="green" text @click="save">
            Save
          </v-btn>
        </template>
        <template v-else>
          <v-btn color="green" text @click="step = 1">
            Continue
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["mode"],
  data() {
    return {
      dialog: false,
      step: 0,
      routine: {
        name: "",
        day: "",
        repeatWeekly: false,
        scenarios: [],
      },
      quantityRules: [
        (v) => v <= 100 || "Quantity cannot be more than a 100",
        (v) => v > 0 || "Quantity cannot be less than 0",
        (v) => !!v || "Quantity must have a value",
      ],
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    };
  },
  computed: {
    scenarios() {
      var id = 0;

      return this.$store.state.routines.scenarios.map((scenario) => ({
        ...scenario,
        id: id++,
        quantity: 1,
        _quantity: null,
        dialog: false,
        valid: false,
      }));
    },
  },
  methods: {
    save() {

    },
    increaseQuantity(scenario) {
      scenario.quantity = Number(scenario.quantity) + 1;
    },
    decreaseQuantity(scenario) {
      if (scenario.quantity == 0) return;
      scenario.quantity = Number(scenario.quantity) - 1;
    },
    removeScenario(scenario) {
      this.routine.scenarios.splice(
        this.routine.scenarios.findIndex((x) => x.id == scenario.id),
        1
      );
    },
  },
};
</script>

<style scoped>
>>> .theme--dark.v-stepper {
  background: transparent;
}
>>> [contenteditable] {
  outline: 0px solid transparent;
}
>>> .v-list-item {
  padding-left: 0px;
}
>>> .v-stepper,
.v-stepper__header {
  box-shadow: none !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
>>> .v-stepper__content {
  padding-bottom: 0px;
}
</style>
