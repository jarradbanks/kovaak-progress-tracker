<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  props: {
    data: {
      type: Array,
      default: []
    },
    days: {
      type: Number,
      default: []
    }
  },
  name: "LineChart",
  watch: {
    data: {
      immediate: true,
      deep: true,
      handler() {
        var d = [];

        this.data.forEach(value => {
          d.push(value);
        });

        var unique = [...new Set([...this.data.map(x => x.date)])];

        unique.forEach(date => {
          var filtered = this.data.filter(x => x.date == date);

          if (filtered.length > 0) {
            var highest = filtered.reduce(function(prev, current) {
              return Number(prev.score) > Number(current.score)
                ? Number(prev.score)
                : Number(current.score);
            });

            var average =
              filtered.reduce((a, b) => a + Number(b.score), 0) /
              filtered.length;

            var lowest = filtered.reduce(function(prev, current) {
              return Number(prev.score) < Number(current.score)
                ? Number(prev.score)
                : Number(current.score);
            });

            console.log(`${date}: Highest Score: ` + highest),
              console.log(`${date}: Average Score: ` + average);
            console.log(`${date}: Lowest Score: ` + lowest);
          }
        });

        //highest score that day

        //average score that day

        //lowest score that day
        this.renderChart(
          {
            labels: ["2020-07-27"],
            datasets: [
              {
                label: "Highest Score",
                backgroundColor: [
                  "rgba(255, 99, 132, 0.2)",
                  "rgba(54, 162, 235, 0.2)",
                  "rgba(255, 206, 86, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(153, 102, 255, 0.2)",
                  "rgba(255, 159, 64, 0.2)"
                ],
                borderColor: [
                  "rgba(255,99,132,1)",

                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",

                  "rgba(255, 159, 64, 1)"
                ],
                data: [530.631531]
              },
              {
                label: "Average Score",
                backgroundColor: [
                  "rgba(255, 99, 132, 0.2)",
                  "rgba(54, 162, 235, 0.2)",
                  "rgba(255, 206, 86, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(153, 102, 255, 0.2)",
                  "rgba(255, 159, 64, 0.2)"
                ],
                borderColor: [
                  "rgba(255,99,132,1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)"
                ],
                data: [521.551056]
              },
              {
                label: "Lowest Score",
                backgroundColor: [
                  "rgba(153, 102, 255, 0.2)",
                  "rgba(255, 159, 64, 0.2)"
                ],
                borderColor: [
                  "rgba(255,99,132,1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)"
                ],
                data: [512.470581]
              }
            ]
          },
          {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true
                  }
                }
              ]
            }
          }
        );
      }
    }
  }
};
</script>

<style scoped>
>>> .chart {
  color: white !important;
  width: 100%;
}
</style>
