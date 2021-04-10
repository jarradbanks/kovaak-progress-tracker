<template>
  <v-container fluid>
    <v-row dense style="height: 100%">
      <v-col cols="6">
        <v-combobox
          outlined
          dense
          label="Scenario"
          v-model="scenario"
          :items="$scenarios"
        ></v-combobox>
      </v-col>
      <v-col cols="3"></v-col>
      <v-col cols="3">
        <v-select
          v-model="days"
          outlined
          dense
          label="Filter By"
          item-text="name"
          item-value="value"
          :items="[
            { name: 'Today', value: 1 },
            { name: '3 Days Ago', value: 3 },
            { name: '1 Week', value: 7 },
            { name: '2 Weeks', value: 14 },
            { name: '1 Month', value: 30 },
            { name: '3 Months', value: 90 },
          ]"
        ></v-select>
      </v-col>

      <v-col cols="12" class="py-0 my-0"
        >Overall Accuracy: {{ totalAccuracy.toFixed(2) }}%</v-col
      >
      <v-col cols="12" style="color: white !important">
        <line-chart
          :data="!loading ? data : []"
          :days="Number(days)"
        ></line-chart>
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
    LineChart,
  },
  data() {
    return {
      loading: true,
      filesToLoad: 0,
      filesLoaded: 0,
      scenario: "",
      files: [],
      days: 7,
      data: [],
      totalAccuracy: 0,
    };
  },
  created() {
    ipcRenderer.send("chokidar-watch", this.$config);

    this.handleEventListeners();
  },
  computed: {
    $config() {
      return this.$store.state.configuration.data;
    },
    $scenarios() {
      var scenarios = [];

      this.files.forEach((file) => {
        if (!scenarios.includes(file.scenario)) {
          scenarios.push(file.scenario);
        }
      });

      return scenarios;
    },
  },
  watch: {
    scenario: {
      immediate: true,
      deep: true,
      handler() {
        this.getFilesForScenario();
      },
    },
    days: {
      immediate: true,
      deep: true,
      handler(newDays, oldDays) {
        console.log(newDays, oldDays);
        this.getFilesForScenario();
      },
    },
    $config: {
      immediate: true,
      deep: true,
      handler() {
        ipcRenderer.send("get-kovaak-data", this.$config.path);
      },
    },
  },
  methods: {
    getFilesForScenario() {
      this.filesToLoad = 0;
      this.filesLoaded = 0;
      this.data = [];
      this.loading = true;

      var files = this.files.filter(
        (x) =>
          x.scenario == this.scenario &&
          Math.abs(x.date.diff(this.moment().startOf("day"), "days")) <
            this.days
      );
      console.log(files);
      if (files.length > 0) {
        this.filesToLoad = files.length - 1;

        files.forEach((file) => {
          ipcRenderer.send("get-kovaak-file", {
            path: this.$config.path,
            name: file.path,
            date: this.days == 1 ? file.time : file.date.format("YYYY-MM-DD"),
          });
        });
      } else {
        console.log("No files");
        this.loading = false;
      }
    },
    handleEventListeners() {
      /* New KovaaK Statistic File */
      ipcRenderer.on("chokidar-add", (event, data) => {
        if (this.files.find((x) => x.path == data.fileName) == null) {
          this.files.push({
            scenario: data.scenario,
            date: this.moment(data.date, ["YYYY-MM-DD"]),
            datetime: this.moment(`${data.date} ${data.time}`, [
              "YYYY-MM-DD HH:mm:ss",
            ]),
            time: data.time,
            path: data.fileName,
          });
        }

        if (this.scenario && this.scenario == data.scenario) {
          console.log("getting file ");
          ipcRenderer.send("get-kovaak-file", {
            path: this.$config.path,
            name: data.fileName,
            date: this.days == 1 ? data.time : data.date,
          });
        }
      });
      /* KovaaK Statistic File Removed */
      ipcRenderer.on("chokidar-remove", (event, data) => {
        var index = this.files.findIndex((x) => x.path == data);

        if (index != -1) {
          this.files.splice(index, 1);
        }

        var dIndex = this.data.findIndex((x) => x.name == data);

        if (dIndex != -1) {
          this.data.splice(dIndex, 1);
        }
      });

      /* Initial Directory Scan Complete */
      ipcRenderer.on("chokidar-ready", (event, data) => {
        var scenarios = this.$scenarios;
        if (scenarios && !this.scenario) {
          this.scenario = scenarios[0];
        }
      });

      ipcRenderer.on("got-kovaak-file", (event, data) => {
        console.log(
          `Loaded ${this.filesLoaded + 1}/${this.filesToLoad + 1} files for ${
            this.scenario
          }`
        );
        console.log(data);
        if (this.data.find((x) => x.name == data.name) == null) {
          this.data.push({
            name: data.name,
            scenario: data[3]["Scenario"],
            date: data.date,
            score: data[3]["Score"],
            averageTimeToKill: data[3]["Avg TTK"],
            horziontalSensitivity: data[3]["Horiz Sens"],
            verticalSensitivity: data[3]["Vert Sens"],
            sensitivityScale: data[3]["Sens Scale"],
            accuracy: (data[2].Hits / data[2].Shots) * 100,
          });
        }

        if (this.filesLoaded < this.filesToLoad) {
          this.filesLoaded++;
        } else {
          this.loading = false;

          this.totalAccuracy =
            ([...new Set([...this.data.map((x) => x.accuracy)])].reduce(
              (a, b) => a + b,
              0
            ) /
              (100 * this.data.length)) *
            100;
        }
      });
    },
  },
};
</script>

<style scoped></style>
