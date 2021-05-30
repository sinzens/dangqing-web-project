<template>
  <v-container class="pa-0" style="user-select: none;">
    <v-row class="ma-0 pl-2">
      <v-col class="pa-0">
        <span
          style="color: white; font-size: 14px;"
          v-text="`${$texts.text.statusBar.databaseHost}: ${databaseInfo.host}`"
        />
      </v-col>
      <v-col class="pa-0">
        <span
          style="color: white; font-size: 14px;"
          v-text="`${$texts.text.statusBar.databaseVersion}: ${$store.getters.databaseVersion}`"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'StatusBar',

  computed: {
    databaseInfo () {
      const configStr = this.$store.getters.config as string
      return configStr.length === 0
        ? this.$texts.text.configError
        : JSON.parse(configStr).database
    }
  }
})
</script>
