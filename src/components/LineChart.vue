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
        var highestScores = [],
          averageScores = [],
          lowestScores = [];

        var dates = [...new Set([...this.data.map(x => x.date)])];

        dates.forEach(date => {
          var filtered = this.data.filter(x => x.date == date);

          if (filtered.length > 0) {
            var average = 0;
            if (filtered.length > 3) {
              average =
                filtered.reduce((a, b) => a + Number(b.score), 0) /
                filtered.length;
            } else {
              average = filtered[0].score;
            }

            var scores = filtered.map(x => Number(x.score));

            var highest = Math.max(...scores);

            var lowest = Math.min(...scores);

            highestScores.push(highest);

            averageScores.push(average);

            lowestScores.push(lowest);
          }
        });

        this.renderChart(
          {
            labels: dates,
            datasets:
              this.days == 1
                ? [
                    {
                      label: "Score",
                      backgroundColor: ["rgba(250, 190, 88, 0.25)"],
                      borderColor: ["rgba(245, 171, 53, 1)"],
                      data: averageScores
                    }
                  ]
                : [
                    {
                      label: "Highest Score",
                      backgroundColor: ["rgba(250, 190, 88, 0.25)"],
                      borderColor: ["rgba(245, 171, 53, 1)"],
                      data: highestScores
                    },
                    {
                      label: "Average Score",
                      backgroundColor: ["rgba(30, 130, 76, 0.25)"],
                      borderColor: ["rgba(38, 166, 91, 1)"],
                      data: averageScores
                    },
                    {
                      label: "Lowest Score",
                      backgroundColor: ["rgba(246, 71, 71, 0.25)"],
                      borderColor: ["rgba(150, 40, 27, 1)"],
                      data: lowestScores
                    }
                  ]
          },
          {
            responsive: true,
            maintainAspectRatio: false,
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
