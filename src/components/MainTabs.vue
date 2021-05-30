<template>
  <div
    style="flex: 1; display: flex; flex-direction: column; align-items: stretch; justify-content: stretch;"
  >
    <v-toolbar height="40" style="flex: unset; z-index: 2;" flat>
      <v-tabs
        color="indigo"
        v-model="currentTab"
        center-active
        show-arrows
      >
        <v-tab
          v-for="(tab, index) in $store.getters.openingTabs"
          :key="tab.key"
          style="font-size: 13.5px;"
          @contextmenu="tabContextMenu"
        >
          <template v-slot:default>
            <span>{{ tab.header }}</span>
            <v-icon v-text="'mdi-close'" @click="removeTab(index)" dense />
          </template>
        </v-tab>
      </v-tabs>
    </v-toolbar>
    <v-divider />
    <div style="flex: 1; display: flex; align-items: stretch;">
      <v-tabs-items v-model="currentTab">
        <v-tab-item
          v-for="(tab, index) in $store.getters.openingTabs"
          :key="tab.key"
        >
          <main-tab-pages v-if="index === currentTab" :page="tab.page" />
        </v-tab-item>
      </v-tabs-items>
    </div>
    <v-toolbar height="30" style="flex: unset;">
      <v-spacer />
      <v-dialog v-model="showExportDialog" max-width="50%" v-if="isDataTab">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            color="primary"
            v-on="on"
            v-bind="attrs"
            v-text="$texts.text.exportData"
            height="25"
            text tile
          />
        </template>
        <v-card tile>
          <v-card-title class="headline" v-text="$texts.title.exportData" />
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="8">
                  <v-text-field
                    v-model="exportFileName"
                    :label="$texts.text.fileName"
                    :rules="fileNameRules"
                    dense
                  />
                </v-col>
                <v-col>
                  <v-select
                    v-model="exportExtName"
                    :no-data-text="$texts.text.noData"
                    :label="$texts.text.extName"
                    :items="exportExts"
                    dense
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
              <v-btn
                color="primary"
                v-text="$texts.text.cancel"
                @click="showExportDialog = false"
                text
              />
              <v-btn
                color="primary"
                v-text="$texts.text.confirm"
                @click="exportData"
                text
              />
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-btn
        color="primary"
        v-text="$texts.text.save"
        v-if="$store.getters.currentTabPage === 'settings'"
        height="25"
        @click="saveConfig"
        text tile
      />
    </v-toolbar>
    <v-menu
      v-model="showTabContextMenu"
      :position-x="tabContextMenuPos.x"
      :position-y="tabContextMenuPos.y"
      absolute
      offset-overflow
    >
      <v-list dense>
        <v-list-item
          v-for="item in tabContextMenuItems"
          :key="item.role"
          link
        >
          <v-list-item-content>
            <v-list-item-title v-text="item.header" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { DataTableItems, Page, Table } from '../interface'
import MainTabPages from './MainTabPages.vue'

type ExportExt = 'xls' | 'xlsx'

interface TabContextMenuItem {
  header: string
  role: string
}

export default Vue.extend({
  name: 'MainTabs',
  components: { MainTabPages },

  data () {
    return {
      showTabContextMenu: false,
      showExportDialog: false,

      exportFileName: String(),
      exportExtName: 'xls' as ExportExt,
      exportExts: ['xls', 'xlsx'] as ExportExt[],

      tabContextMenuPos: { x: -1, y: -1 },
      tabContextMenuItems: [] as TabContextMenuItem[],

      fileNameRules: [
        (name: string | null) => !!name || this.$texts.text.emptyNotAllowed
      ]
    }
  },

  methods: {
    removeTab (index: number) {
      this.$store.dispatch('removeTab', index)
    },

    tabContextMenu (event: MouseEvent) {
      event.preventDefault()
      this.showTabContextMenu = false
      this.tabContextMenuPos = { x: event.clientX, y: event.clientY }
      this.$nextTick(() => {
        this.showTabContextMenu = true
      })
    },

    exportData () {
      this.showExportDialog = false
      const page = this.$store.getters.currentTabPage as Page
      let data = null

      if (page === 'basicModel') {
        const basicModel = this.$store.getters.basicModelData
        try {
          const modelData = JSON.parse(basicModel)
          data = [modelData]
        } catch (error) {}
      } else {
        const tablesData = JSON.parse(
          this.$store.getters.dataTableData
        ) as Record<Table, DataTableItems>
        data = tablesData[page as Table]
      }

      if (data) {
        window.ipcRenderer.send('exportData', {
          fileName: this.exportFileName,
          extName: this.exportExtName,
          data: JSON.stringify(data)
        })
      }
    },

    saveConfig () {
      const edited = this.$store.getters.editedConfig
      this.$store.dispatch('setConfig', edited)
      window.ipcRenderer.send('saveConfig', edited)
    }
  },

  computed: {
    currentTab: {
      get () {
        return this.$store.getters.currentTab
      },

      set (value) {
        this.$store.dispatch('setTab', value)
      }
    },

    isDataTab () {
      const page = this.$store.getters.currentTabPage as Page
      return (
        page === 'basicModel' ||
        page === 'batchTable' ||
        page === 'atdTable' ||
        page === 'dtaTable'
      )
    }
  }
})
</script>

<style lang="scss">
.v-tabs-items {
  display: flex;
  flex: 1;
  .v-window__container {
    display: flex;
    flex: 1;
    .v-window-item {
      flex: 1;
      display: flex;
    }
  }
}
</style>
