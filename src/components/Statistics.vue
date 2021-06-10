<template>
  <v-container>
    <v-row>
      <v-carousel
        v-model="currentChart"
        v-if="statisticsModels.length > 1"
        hide-delimiter-background
        show-arrows-on-hover
        height="550"
        light
      >
        <template v-slot:prev="{ on, attrs }">
          <v-btn color="white" v-on="on" v-bind="attrs" icon>
            <v-icon v-text="'mdi-chevron-left'" />
          </v-btn>
        </template>
        <template v-slot:next="{ on, attrs }">
          <v-btn color="white" v-on="on" v-bind="attrs" icon>
            <v-icon v-text="'mdi-chevron-right'" />
          </v-btn>
        </template>
        <v-carousel-item v-for="(model, index) in statisticsModels" :key="index">
          <chart :statisticsModel="model" v-if="index === currentChart" />
        </v-carousel-item>
      </v-carousel>
      <chart :statisticsModel="statisticsModels[0]" style="height: 500px;" v-else />
    </v-row>
    <v-toolbar flat>
      <v-spacer />
      <v-dialog v-model="showChartDialog">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            v-on="on"
            v-bind="attrs"
            v-text="$texts.text.zoomOutView"
            text tile
          />
        </template>
        <v-card tile>
          <v-card-title v-text="$texts.title.statistics" />
          <v-card-text>
            <chart :statisticsModel="statisticsModels[currentChart]" style="height: 70vh;" v-if="showChartDialog" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              v-text="$texts.text.confirm"
              @click="showChartDialog = false"
              tile text
            />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
  </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { StatisticsModel } from '@/interface'
import Chart from './Chart.vue'

export default Vue.extend({
  name: 'Statistics',
  components: { Chart },

  props: {
    statisticsModels: {
      type: Array as PropType<StatisticsModel[]>,
      required: true
    }
  },

  data () {
    return {
      showChartDialog: false,
      currentChart: 0
    }
  }
})
</script>

<style lang="scss">
.v-responsive__content {
  padding-bottom: 50px;
}
</style>
