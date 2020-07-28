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
        <line-chart :data="!loading ? data : []" :days="Number(days)"></line-chart>
      </v-col>
    </v-row>
    {{filesLoaded + 1}} / {{filesToLoad + 1}}
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
      loading: true,
      filesToLoad: 0,
      filesLoaded: 0,
      scenario: "",
      files: [],
      days: 7,
      data: []
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

      this.files.forEach(file => {
        if (!scenarios.includes(file.scenario)) {
          scenarios.push(file.scenario);
        }
      });

      return scenarios;
    }
  },
  watch: {
    scenario: {
      immediate: true,
      deep: true,
      handler() {
        this.getFilesForScenario();
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
    getFilesForScenario() {
      this.filesToLoad = 0;
      this.filesLoaded = 0;
      this.loading = true;
      this.data = [];

      var files = this.files.filter(
        x =>
          x.scenario == this.scenario &&
          Math.abs(x.date.diff(this.moment().startOf("day"), "days")) <
            Number(this.days)
      );

      this.filesToLoad = files.length - 1;

      files.forEach(file => {
        ipcRenderer.send("get-kovaak-file", {
          path: this.$config.path,
          name: file.path,
          date: this.days == 1 ? file.time : file.date.format("YYYY-MM-DD")
        });
      });
    },
    handleEventListeners() {
      /* New KovaaK Statistic File */
      ipcRenderer.on("chokidar-add", (event, data) => {
        if (this.files.find(x => x.path == data.fileName) == null) {
          this.files.push({
            scenario: data.scenario,
            date: this.moment(data.date, ["YYYY-MM-DD"]),
            datetime: this.moment(`${data.date} ${data.time}`, [
              "YYYY-MM-DD HH:mm:ss"
            ]),
            time: data.time,
            path: data.fileName
          });
        }

        if (this.scenario && this.scenario == data.scenario) {
          console.log("getting file ");
          ipcRenderer.send("get-kovaak-file", {
            path: this.$config.path,
            name: data.fileName,
            date: this.days == 1 ? data.time : data.date
          });
        }
      });
      /* KovaaK Statistic File Removed */
      ipcRenderer.on("chokidar-remove", (event, data) => {
        var index = this.files.findIndex(x => x.path == data);

        if (index != -1) {
          this.files.splice(index, 1);
        }

         var dIndex = this.data.findIndex(x => x.name == data);

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
          `Loaded ${this.filesLoaded}/${this.filesToLoad} files for ${this.scenario}`
        );
        console.log(data);
        if (this.data.find(x => x.name == data.name) == null) {
          this.data.push({
            name: data.name,
            scenario: data[3]["Scenario"],
            date: data.date,
            score: data[3]["Score"],
            averageTimeToKill: data[3]["Avg TTK"],
            horziontalSensitivity: data[3]["Horiz Sens"],
            verticalSensitivity: data[3]["Vert Sens"],
            sensitivityScale: data[3]["Sens Scale"],
            accuracy: (data[2].Hits / data[2].Shots) * 100
          });
        } else {
          console.log("already existsa");
        }

        if (this.filesLoaded < this.filesToLoad) {
          this.filesLoaded++;
        } else {
          this.loading = false;
        }
      });
      /*     ipcRenderer.on("got-kovaak-data", (event, data) => {
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
      }); */
    }
  }
};
</script>

<style scoped></style>
