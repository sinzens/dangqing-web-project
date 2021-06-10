<template>
  <div ref="chartContainer" :style="containerStyle">
    <div
      ref="chart"
      :class="chartClasses"
      @mousedown.stop="onMouseDownChart"
      @mousemove.stop="onMouseMoveChart"
      @mouseup.stop="onMouseUpChart"
      @mouseleave.stop="onMouseLeaveChart"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { StatisticsModel } from '@/interface'
import * as echarts from 'echarts/core'
import { EChartsOption } from 'echarts'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
import {
  GridComponent,
  TitleComponent,
  DataZoomSliderComponent,
  DataZoomInsideComponent,
  ToolboxComponent,
  TooltipComponent
} from 'echarts/components'

import {
  BarChart,
  LineChart,
  GraphChart
} from 'echarts/charts'

echarts.use([
  BarChart,
  LineChart,
  GraphChart,
  GridComponent,
  TitleComponent,
  DataZoomSliderComponent,
  DataZoomInsideComponent,
  ToolboxComponent,
  TooltipComponent,
  CanvasRenderer,
  SVGRenderer
])

export default Vue.extend({
  name: 'Chart',

  props: {
    statisticsModel: {
      type: Object as PropType<StatisticsModel>,
      required: true
    }
  },

  data () {
    return {
      chartDragging: false,

      dragX: 0,
      dragY: 0,

      chart: null as echarts.ECharts | null,

      initialOption: {
        title: {
          left: 12,
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16
          }
        },
        dataZoom: [{
          type: 'slider',
          show: true,
          xAxisIndex: [0]
        }, {
          type: 'inside',
          xAxisIndex: [0]
        }],
        toolbox: {
          show: true,
          right: 50,
          feature: {
            magicType: {
              show: true,
              type: ['line', 'bar']
            }
          }
        },
        tooltip: {
          show: true
        }
      } as EChartsOption
    }
  },

  methods: {
    initChart () {
      setTimeout(() => {
        const element = this.$refs.chart as HTMLElement | undefined
        if (element) {
          this.chart = echarts.init(element, undefined, {
            renderer: this.statisticsModel.renderMode
          })
          this.resetOption(this.statisticsModel.option)
        }
      }, 0)
    },

    resizeChart () {
      if (this.chart) {
        this.chart.resize()
      }
    },

    resetOption (option: EChartsOption) {
      if (this.chart) {
        this.chart.setOption(this.initialOption, true)
        this.chart.setOption(option, this.statisticsModel.notMerge)
      }
    },

    onMouseDownChart (event: MouseEvent) {
      if (event.button === 0) {
        this.chartDragging = true
        this.dragX = event.clientX
        this.dragY = event.clientY
      }
    },

    onMouseMoveChart (event: MouseEvent) {
      if (this.chartDragging) {
        const container = this.$refs.chartContainer as HTMLElement
        if (container) {
          const dragX = this.dragX - event.clientX
          const dragY = this.dragY - event.clientY

          this.dragX = event.clientX
          this.dragY = event.clientY

          container.scrollBy({ left: dragX, top: dragY })
        }
      }
    },

    onMouseUpChart (event: MouseEvent) {
      if (event.button === 0) {
        this.chartDragging = false
        this.dragX = 0
        this.dragY = 0
      }
    },

    onMouseLeaveChart () {
      this.chartDragging = false
      this.dragX = 0
      this.dragY = 0
    }
  },

  computed: {
    containerStyle () {
      const baseStyle = {
        height: '100%',
        position: 'relative'
      }
      if (this.statisticsModel.backgroundImage) {
        return {
          ...baseStyle,
          overflow: 'auto'
        }
      } else {
        return baseStyle
      }
    },

    chartClasses (): string[] {
      const baseClass = ['chart']
      if (this.statisticsModel.backgroundImage) {
        return baseClass.concat('with-background-image')
      } else {
        return baseClass
      }
    },

    isWithBackground (): boolean {
      return this.chartClasses.includes('with-background-image')
    }
  },

  watch: {
    statisticsModel: {
      handler (model: StatisticsModel) {
        this.resetOption(model.option)
      },
      deep: true
    }
  },

  created () {
    window.addEventListener('resize', this.resizeChart)
  },

  mounted () {
    this.initChart()
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.resizeChart)
  }
})
</script>

<style lang="scss" scoped>
.chart {
  position: absolute;
  width: 100%;
  height: 100%;

  &.with-background-image {
    width: 2748px;
    height: 960px;
    background-image: url(../assets/area.png);
    background-size: contain;
    background-position: center;
  }
}
</style>
