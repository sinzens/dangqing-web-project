<template>
  <v-app>
    <v-system-bar class="pa-0" color="white" app>
      <title-bar />
    </v-system-bar>
    <v-main>
      <router-view/>
    </v-main>
    <v-footer class="pa-0" color="indigo" app>
      <status-bar />
    </v-footer>
    <v-dialog v-model="showNotificationDialog" width="40%">
      <v-card tile>
        <v-card-title class="headline" v-text="notificationTitle" />
        <v-card-text v-text="notificationContent" />
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="showNotificationDialog = false"
            v-text="$texts.text.confirm"
            tile
            text
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import TitleBar from './components/TitleBar.vue'
import StatusBar from './components/StatusBar.vue'

export default Vue.extend({
  name: 'App',
  components: { TitleBar, StatusBar },

  data () {
    return {
      dataPreFetched: false,
      showNotificationDialog: false,
      notificationTitle: String(),
      notificationContent: String()
    }
  },

  methods: {
    checkConfig () {
      const config = this.$store.getters.config as string
      if (config.length === 0) {
        window.ipcRenderer.send('loadConfig')
      }
    },

    checkBackup () {
      const backup = this.$store.getters.dataTableBackup as string
      if (backup === JSON.stringify(Object())) {
        window.ipcRenderer.send('loadBackup')
      }
    },

    checkDatabaseVersion () {
      window.ipcRenderer.send('query', {
        type: 'getVersion',
        sql: 'select VERSION()'
      })
    },

    checkDatabaseConnection () {
      window.ipcRenderer.send('connect')
    },

    saveBackup () {
      const isConnected = this.$store.state.databaseVersion !== 'Not connected'
      if (!isConnected) { return }

      const backup = this.$store.state.dataTableBackup
      try {
        JSON.parse(backup)
        window.ipcRenderer.send('saveBackup', backup)
      } catch (error) {}
    },

    queryResultHandler ({ type, results }: {
      type: string,
      results: Record<string, unknown>[],
      field: Record<string, unknown>[]
    }) {
      switch (type) {
        case 'getVersion': {
          this.$store.dispatch(
            'setDatabaseVersion',
            results[0]['VERSION()'] as string
          )
          break
        }
      }
    },

    onConfigLoaded (_event: unknown, config: string) {
      this.$store.dispatch('setConfig', config)
    },

    onBackupLoaded (event: unknown, backup: string) {
      try {
        const backupObj = JSON.parse(backup)
        this.$store.dispatch('replaceDataTableBackup', backupObj)
      } catch (error) {
        this.onError(event, this.$texts.text.backupError)
      }
    },

    onDatabaseConnected () {
      this.checkDatabaseVersion()
    },

    onError (_event: unknown, message: string) {
      this.notificationTitle = this.$texts.title.error
      this.notificationContent = message
      this.showNotificationDialog = true
    },

    onInfo (_event: unknown, message: string) {
      this.notificationTitle = this.$texts.title.notification
      this.notificationContent = message
      this.showNotificationDialog = true
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onQueryResult (_event: unknown, result: any) {
      this.queryResultHandler(result)
    },

    attachEvents () {
      window.ipcRenderer.on('configLoaded', this.onConfigLoaded)
      window.ipcRenderer.on('backupLoaded', this.onBackupLoaded)
      window.ipcRenderer.on('databaseConnected', this.onDatabaseConnected)
      window.ipcRenderer.on('error', this.onError)
      window.ipcRenderer.on('info', this.onInfo)
      window.ipcRenderer.on('queryResult', this.onQueryResult)

      window.addEventListener('beforeunload', this.saveBackup)
    },

    detachEvents () {
      window.ipcRenderer.removeListener('configLoaded', this.onConfigLoaded)
      window.ipcRenderer.removeListener('backupLoaded', this.onBackupLoaded)
      window.ipcRenderer.removeListener('databaseConnected', this.onDatabaseConnected)
      window.ipcRenderer.removeListener('error', this.onError)
      window.ipcRenderer.removeListener('info', this.onInfo)
      window.ipcRenderer.removeListener('queryResult', this.onQueryResult)

      window.removeEventListener('beforeunload', this.saveBackup)
    }
  },
  created () {
    this.attachEvents()
    this.checkConfig()
    this.checkBackup()
    this.checkDatabaseConnection()
  },

  beforeDestroy () {
    this.saveBackup()
    this.detachEvents()
  }
})
</script>

<style lang="scss">
.v-dialog {
  border-radius: 0 !important;
}
</style>
