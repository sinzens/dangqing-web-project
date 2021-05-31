<template>
  <div style="flex: 1; position: relative; overflow: auto;">
    <webview class="fill-height" :src="aboutPath" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'About',

  data () {
    return {
      aboutPath: String()
    }
  },

  created () {
    window.ipcRenderer.send('loadAbout')
    window.ipcRenderer.on('aboutLoaded', (_event, path) => {
      this.aboutPath = `file://${path}`
    })
  }
})
</script>
