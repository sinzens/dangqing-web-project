<template>
  <div style="flex: 1; display: flex;">
    <basic-model v-if="page === 'basicModel'" />
    <data-source :table="page" v-else-if="isTablePage()" />
    <settings v-else-if="page === 'settings'" />
    <about v-else-if="page === 'about'" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Page } from '../interface'
import BasicModel from './BasicModel.vue'
import DataSource from './DataSource.vue'
import Settings from './Settings.vue'
import About from './About.vue'

export default Vue.extend({
  name: 'MainTabPages',
  components: { BasicModel, DataSource, Settings, About },

  props: {
    page: String as PropType<Page>
  },

  methods: {
    isTablePage () {
      const page = this.page
      return (
        page === 'batchTable' ||
        page === 'atdTable' ||
        page === 'dtaTable' ||
        page === 'stopTable' ||
        page === 'securityTable'
      )
    }
  }
})
</script>
