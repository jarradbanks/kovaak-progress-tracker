<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    days: {
      type: Number,
      default: () => null,
    },
  },
  name: "LineChart",
  data() {
    return {
      filtered: [],
    };
  },
  watch: {
    data: {
      immediate: true,
      deep: true,
      handler() {
        if (this.data.length > 0) {
          var highestScores = [],
            averageScores = [],
            lowestScores = [];

          var dates = [...new Set([...this.data.map((x) => x.date)])];

          for (let i = 0; i < dates.length; i++) {
            const date = dates[i];

            this.filtered = this.data.filter((x) => x.date == date);

            var average = 0;

            if (this.filtered.length > 3) {
              average =
                this.filtered.reduce((a, b) => a + Number(b.score), 0) /
                this.filtered.length;
            } else {
              average = this.filtered[0].score;
            }

            var scores = this.filtered.map((x) => Number(x.score));

            var highest = Math.max(...scores);
            var lowest = Math.min(...scores);

            highestScores.push(highest);
            averageScores.push(average);
            lowestScores.push(lowest);
          }

          var datasets =
            this.days == 1
              ? [
                  {
                    label: "Score",
                    backgroundColor: ["rgba(0, 0, 0, 1)"],
                    fill: false,
                    borderColor: ["rgba(245, 171, 53, 1)"],
                    data: averageScores,
                  },
                ]
              : [
                  {
                    label: "Highest Score",
                    backgroundColor: ["rgba(0, 0, 0, 1)"],
                    borderColor: ["rgba(245, 171, 53, 1)"],
                    fill: false,
                    data: highestScores,
                  },
                  {
                    label: "Average Score",
                    backgroundColor: ["rgba(0, 0, 0, 1)"],
                    borderColor: ["rgba(38, 166, 91, 1)"],
                    fill: false,
                    data: averageScores,
                  },
                  {
                    label: "Lowest Score",
                    backgroundColor: ["rgba(0, 0, 0, 1)"],
                    borderColor: ["rgba(150, 40, 27, 1)"],
                    fill: false,
                    data: lowestScores,
                  },
                ];

          this.render(dates, datasets);
        } else {
          this.render(
            [],
            [
              {
                label: "Highest Score",
                backgroundColor: ["rgba(250, 190, 88, 0.25)"],
                borderColor: ["rgba(245, 171, 53, 1)"],
                fill: false,
                data: [],
              },
              {
                label: "Average Score",
                backgroundColor: ["rgba(30, 130, 76, 0.25)"],
                borderColor: ["rgba(38, 166, 91, 1)"],
                fill: false,
                data: [],
              },
              {
                label: "Lowest Score",
                backgroundColor: ["rgba(246, 71, 71, 0.25)"],
                borderColor: ["rgba(150, 40, 27, 1)"],

                data: [],
              },
            ]
          );
        }
      },
    },
  },
  methods: {
    render(labels, datasets) {
      this.renderChart(
        {
          labels: labels,
          datasets: datasets,
        },
        {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        }
      );
    },
  },
};
</script>

<style scoped>
>>> .chart {
  color: white !important;
  width: 100%;
}
</style>
