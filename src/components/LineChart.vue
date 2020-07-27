<template>
  <div class="chart" ref="chart" style="height: 300px;"></div>
</template>

<script>
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

export default {
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
          d.push({
            date: value.date,
            value: value.score
            /* data: {
              score: value.score,
              averageTimeToKill: value.averageTimeToKill,
              horziontalSensitivity: value.horziontalSensitivity,
              verticalSensitivity: value.verticalSensitivity,
              sensitivityScale: value.sensitivityScale,
              accuracy: value.accuuracy
            } */
          });
        });

        console.log(
          this.data.reduce(function(prev, current) {
            return Number(prev.score) > Number(current.score) ? prev : current;
          })
        );
        //highest score that day

        //average score that day

        //lowest score that day
        this.chart.data = d;
      }
    }
  },
  mounted() {
    let chart = am4core.create(this.$refs.chart, am4charts.XYChart);

    // Create axees
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 60;

    dateAxis.renderer.labels.template.fill = am4core.color("#fffff");

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.labels.template.fill = am4core.color("#fffff");

    // Create series
    var series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = "value";
    series.dataFields.dateX = "date";
    series.tooltipText = "{value}";

    series.tooltip.pointerOrientation = "vertical";

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.snapToSeries = series;
    chart.cursor.xAxis = dateAxis;

    this.chart = chart;
  },

  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
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
