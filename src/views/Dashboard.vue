<template>
  <v-container fluid>
    <v-row dense style="height: 100%;">
      <v-col cols="6">
        <v-combobox outlined dense label="Scenario" v-model="scenario" :items="$scenarios"></v-combobox>
      </v-col>
      <v-col cols="3"></v-col>
      <v-col cols="3">
        <v-text-field
          dense
          outlined
          type="number"
          v-model="days"
          :label="'Filter By Last ' + days + ' days'"
        ></v-text-field>
      </v-col>

      <v-col cols="12" style="color: white !important;">
        <line-chart :data="data" :days="Number(days)"></line-chart>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LineChart from "@/components/LineChart.vue";
const { ipcRenderer } = require("electron");

export default {
  name: "Dashboard",
  components: {
    LineChart
  },
  data() {
    return {
      scenario: "",
      files: [],
      days: 3,
      data: []
    };
  },
  created() {
    this.handleEventListeners();
  },
  computed: {
    $config() {
      return this.$store.state.configuration.data;
    },
    $filteredFiles() {
      console.log(`Getting Records from Past ${this.days} days`);
      this.data = [];
      return this.files.filter(
        x =>
          x.scenario == this.scenario &&
          Math.abs(x.date.diff(this.moment().startOf("day"), "days")) <
            Number(this.days)
      );
    },
    $scenarios() {
      var scenarios = [];

      this.files.forEach(file => {
        if (!scenarios.includes(file.scenario)) {
          scenarios.push(file.scenario);
        }
      });

      return scenarios;
    }
  },
  watch: {
    $filteredFiles: {
      immediate: true,
      deep: true,
      handler() {
        this.$filteredFiles.forEach(file => {
          ipcRenderer.send("get-kovaak-file", {
            path: this.$config.path,
            name: file.file,
            date: file.datetime.toDate()
          });
        });
      }
    },
    $config: {
      immediate: true,
      deep: true,
      handler() {
        ipcRenderer.send("get-kovaak-data", this.$config.path);
      }
    }
  },
  methods: {
    handleEventListeners() {
      ipcRenderer.on("got-kovaak-file", (event, data) => {
        this.data.push({
          date: data.date,
          score: data[3]["Score"],
          averageTimeToKill: data[3]["Avg TTK"],
          horziontalSensitivity: data[3]["Horiz Sens"],
          verticalSensitivity: data[3]["Vert Sens"],
          sensitivityScale: data[3]["Sens Scale"],
          accuracy: (data[2].Hits / data[2].Shots) * 100
        });
      });
      ipcRenderer.on("got-kovaak-data", (event, data) => {
        console.log(data[0]);
        this.files = data.map(data => ({
          scenario: data.scenario,
          date: this.moment(data.date, ["YYYY-MM-DD"]),
          datetime: this.moment(`${data.date} ${data.time}`, [
            "YYYY-MM-DD HH:mm:ss"
          ]),
          time: data.time,
          file: data.fileName
        }));
      });
    }
  }
};
</script>

<style scoped></style>
