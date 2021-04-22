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
          :items="dateFilters"
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
      dateFilters: [
        { name: "Today", value: 1 },
        { name: "3 Days Ago", value: 3 },
        { name: "1 Week", value: 7 },
        { name: "2 Weeks", value: 14 },
        { name: "1 Month", value: 30 },
        { name: "3 Months", value: 90 },
        { name: "None", value: -1 },
      ],
    };
  },
  created() {
    ipcRenderer.send("chokidarWatch", this.$config);

    this.handleEventListeners();
  },
  computed: {
    $config() {
      return this.$store.state.configuration.data;
    },
    $scenarios() {
      var scenarios = [];

      for (let i = 0; i < this.files.length; i++) {
        const file = this.files[i];

        if (!scenarios.includes(file.scenario)) {
          scenarios.push(file.scenario);
        }
      }

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
      handler() {
        this.getFilesForScenario();
      },
    },
    $config: {
      immediate: true,
      deep: true,
      handler() {
        ipcRenderer.send("getKovaakData", this.$config.path);
      },
    },
  },
  methods: {
    getFilesForScenario() {
      this.filesToLoad = 0;
      this.filesLoaded = 0;
      this.data = [];
      this.loading = true;

      var files = this.files.filter((x) => x.scenario == this.scenario);

      if (this.days != -1) {
        files = files.filter(
          (x) =>
            Math.abs(x.date.diff(this.moment().startOf("day"), "days")) <
            this.days
        );
      }

      if (files.length > 0) {
        this.filesToLoad = files.length - 1;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          ipcRenderer.send("getKovaakFile", {
            path: this.$config.path,
            name: file.path,
            date: this.days == 1 ? file.time : file.date.format("YYYY-MM-DD"),
          });
        }
      } else {
        this.loading = false;
      }
    },
    handleEventListeners() {
      /**
       * Add file to files[] cache when added to directory.
       *
       * @event Chokidar#remove
       */
      ipcRenderer.on("chokidarAdd", (event, data) => {
        // not in files[] cache
        if (this.files.find((x) => x.path == data.fileName) == null) {
          /*
            scenario: kovaak scenario name
            date: kovaak completed date,
            datetime: kovaak completed date and time,
            time: kovaak completed time,
            path: kovaak statistics file name
          */
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

        /* scenario exists and is the currently selected scenario */
        if (this.scenario && this.scenario == data.scenario) {
          /*
            path: configuration path to kovaak installation
          */
          ipcRenderer.send("getKovaakFile", {
            path: this.$config.path,
            name: data.fileName,
            date: this.days == 1 ? data.time : data.date,
          });
        }
      });

      /**
       * Remove file from files[] cache when removed from directory.
       * @event Chokidar#remove
       */
      ipcRenderer.on("chokidarRemove", (data) => {
        var fileIndex = this.files.findIndex((file) => file.path == data);

        if (fileIndex != -1) this.files.splice(fileIndex, 1);

        var dataIndex = this.data.findIndex((data) => data.name == data);

        if (dataIndex != -1) this.data.splice(dataIndex, 1);
      });

      /**
       * Initial scan of directory (/stats) complete.
       * @event Chokidar#ready
       */
      ipcRenderer.on("chokidarReady", () => {
        var scenarios = this.$scenarios;
        if (scenarios && !this.scenario) {
          this.scenario = scenarios[0];
        }
      });

      /**
       * Initial scan of directory (/stats) complete.
       * @event gotKovaakFile
       */
      ipcRenderer.on("gotKovaakFile", (event, data) => {
        /*
        console.log(
          `Loaded ${this.filesLoaded + 1}/${this.filesToLoad + 1} files for ${
            this.scenario
          }`
        );
        */
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
