<template>
  <div class="fill-height" style="display: flex;">
    <div style="width: 270px; display: flex; z-index: 10;">
      <navigator />
    </div>
    <div style="flex: 1; display: flex;">
      <main-tabs />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Navigator from '../components/Navigator.vue'
import MainTabs from '../components/MainTabs.vue'

export default Vue.extend({
  name: 'Home',
  components: { Navigator, MainTabs }
})
</script>
