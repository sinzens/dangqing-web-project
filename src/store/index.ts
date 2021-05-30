import Vue from 'vue'
import Vuex from 'vuex'
import {
  DataTableBackup,
  DataTableItems,
  TabItem,
  Table
} from '../interface'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentTab: -1,
    openingTabs: [] as TabItem[],
    windowMaximized: false,
    config: String(),
    editedConfig: String(),
    databaseVersion: 'Not connected',
    basicModelData: JSON.stringify(Object()),
    dataTableData: JSON.stringify(Object()),
    dataTableBackup: JSON.stringify(Object())
  },

  mutations: {
    SET_TAB (state, tab: number) {
      state.currentTab = tab
    },

    ADD_TAB (state, tab: TabItem) {
      state.currentTab = state.openingTabs.push(tab) - 1
    },

    REMOVE_TAB (state, tab: number) {
      state.openingTabs.splice(tab, 1)
    },

    PUSH_TAB (state, tab) {
      const indexInOpening = state.openingTabs.findIndex(openingTab => {
        return tab.page === openingTab.page
      })
      if (indexInOpening === -1) {
        state.currentTab = state.openingTabs.push(tab) - 1
      } else {
        state.currentTab = indexInOpening
      }
    },

    SET_WINDOW_MAXIMIZED (state, maximized: boolean) {
      state.windowMaximized = maximized
    },

    SET_CONFIG (state, config: string) {
      state.config = config
    },

    SET_EDITED_CONFIG (state, config: string) {
      state.editedConfig = config
    },

    SET_DATABASE_VERSION (state, version: string) {
      state.databaseVersion = version
    },

    SET_BASIC_MODEL_DATA (state, data: Record<string, unknown>) {
      state.basicModelData = JSON.stringify(data)
    },

    SET_DATA_TABLE_DATA (state, { table, data }: {
      table: Table,
      data: DataTableItems
    }) {
      const tableData = JSON.parse(state.dataTableData) as Record<Table, DataTableItems>
      tableData[table] = data
      state.dataTableData = JSON.stringify(tableData)
    },

    ADD_DATA_TABLE_BACKUP (state, { table, key, data }: {
      table: Table,
      key: string,
      data: DataTableItems
    }) {
      const backup = { identifier: key, data: data } as DataTableBackup
      const tableBackups = JSON.parse(state.dataTableBackup) as Record<Table, DataTableBackup[]>
      const tableBackup = tableBackups[table]
      if (tableBackup) {
        tableBackup.push(backup)
      } else {
        tableBackups[table] = [backup]
      }
      state.dataTableBackup = JSON.stringify(tableBackups)
    },

    REPLACE_DATA_TABLE_BACKUP (state, backup: Record<Table, DataTableBackup[]>) {
      state.dataTableBackup = JSON.stringify(backup)
    },

    DELETE_DATA_TABLE_BACKUP (state, { table, key }: {
      table: Table,
      key: string
    }) {
      const tableBackups = JSON.parse(state.dataTableBackup) as Record<Table, DataTableBackup[]>
      const tableBackup = tableBackups[table]
      if (tableBackup) {
        const index = tableBackup.findIndex(backup => backup.identifier === key)
        if (index !== -1) {
          tableBackup.splice(index, 1)
          state.dataTableBackup = JSON.stringify(tableBackups)
        }
      }
    }
  },

  actions: {
    setTab (context, tab) {
      context.commit('SET_TAB', tab)
    },

    addTab (context, tab) {
      context.commit('ADD_TAB', tab)
    },

    removeTab (context, tab) {
      context.commit('REMOVE_TAB', tab)
    },

    pushTab (context, tab) {
      context.commit('PUSH_TAB', tab)
    },

    setWindowMaximized (context, maximized) {
      context.commit('SET_WINDOW_MAXIMIZED', maximized)
    },

    setConfig (context, config) {
      context.commit('SET_CONFIG', config)
    },

    setEditedConfig (context, config) {
      context.commit('SET_EDITED_CONFIG', config)
    },

    setDatabaseVersion (context, version) {
      context.commit('SET_DATABASE_VERSION', version)
    },

    setBasicModelData (context, data) {
      context.commit('SET_BASIC_MODEL_DATA', data)
    },

    setDataTableData (context, tableData) {
      context.commit('SET_DATA_TABLE_DATA', tableData)
    },

    addDataTableBackup (context, backup) {
      context.commit('ADD_DATA_TABLE_BACKUP', backup)
    },

    replaceDataTableBackup (context, backup) {
      context.commit('REPLACE_DATA_TABLE_BACKUP', backup)
    },

    deleteDataTableBackup (context, backup) {
      context.commit('DELETE_DATA_TABLE_BACKUP', backup)
    }
  },

  getters: {
    currentTab: state => state.currentTab,
    currentTabText: state => state.openingTabs[state.currentTab]?.header || String(),
    currentTabPage: state => state.openingTabs[state.currentTab]?.page || 'invalid',
    openingTabs: state => state.openingTabs,
    windowMaximized: state => state.windowMaximized,
    config: state => state.config,
    editedConfig: state => state.editedConfig,
    databaseVersion: state => state.databaseVersion,
    basicModelData: state => state.basicModelData,
    dataTableData: state => state.dataTableData,
    dataTableBackup: state => state.dataTableBackup
  }
})
