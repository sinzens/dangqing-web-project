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
        <v-card-title class="headline" v-text="$store.getters.notificationTitle" />
        <v-card-text v-text="$store.getters.notificationContent" />
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
    <v-snackbar
      v-model="showSnack"
      color="indigo"
      timeout="2000"
      elevation="2"
      tile
    >
      {{ $store.getters.snackContent }}
      <template v-slot:action="{ attrs }">
        <v-icon
          v-text="'mdi-close'"
          v-bind="attrs"
          @click="showSnack = false"
          small
        />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import TitleBar from './components/TitleBar.vue'
import StatusBar from './components/StatusBar.vue'

export default Vue.extend({
  name: 'App',
  components: { TitleBar, StatusBar },

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
        case 'insertData': {
          this.$store.dispatch('snackNotify', {
            show: true,
            content: this.$texts.text.insertDataSuccess
          })
          break
        }
        case 'updateData': {
          this.$store.dispatch('snackNotify', {
            show: true,
            content: this.$texts.text.updateDataSuccess
          })
          break
        }
        case 'deleteData': {
          this.$store.dispatch('snackNotify', {
            show: true,
            content: this.$texts.text.deleteDataSuccess
          })
          break
        }
        case 'restoreData': {
          this.$store.dispatch('snackNotify', {
            show: true,
            content: this.$texts.text.restoreDataSuccess
          })
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
      this.$store.dispatch('notify', {
        show: true,
        title: this.$texts.title.error,
        content: message
      })
    },

    onInfo (_event: unknown, message: string) {
      this.$store.dispatch('notify', {
        show: true,
        title: this.$texts.title.notification,
        content: message
      })
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

  computed: {
    showNotificationDialog: {
      get () {
        return this.$store.getters.showNotificationDialog as boolean
      },

      set (show: boolean) {
        this.$store.dispatch('notify', { show })
      }
    },

    showSnack: {
      get () {
        return this.$store.getters.showSnack as boolean
      },

      set (show: boolean) {
        this.$store.dispatch('snackNotify', { show })
      }
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
  .v-card__text {
    white-space: pre-wrap !important;
  }
}
</style>
