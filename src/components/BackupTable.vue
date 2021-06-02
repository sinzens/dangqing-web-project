<template>
  <v-data-table
    :no-data-text="$texts.text.noData"
    :no-results-text="$texts.text.noResult"
    :headers="headers"
    :items="recordItems"
  >
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon
        class="mr-2"
        v-text="'mdi-backup-restore'"
        @click="restore(item)"
        small
      />
      <v-icon
        class="mr-2"
        v-text="'mdi-delete'"
        @click.stop="deleteBackup(item)"
        small
      />
      <v-icon
        v-text="'mdi-eye'"
        @click.stop="previewBackup(item)"
        small
      />
    </template>
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title v-text="$texts.title.backup" />
        <v-dialog v-model="showDeleteDialog" max-width="50%">
          <v-card tile>
            <v-card-title v-text="$texts.title.deleteBackup" />
            <v-card-text v-text="$texts.text.deleteBackupConfirm" />
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                v-text="$texts.text.cancel"
                @click="showDeleteDialog = false"
                text
              />
              <v-btn
                color="primary"
                v-text="$texts.text.confirm"
                @click="deleteBackupConfirm"
                text
              />
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="showPreviewDialog" max-width="70%">
          <v-card tile>
            <v-card-title v-text="$texts.title.backupPreview" />
            <v-card-text>
              <span v-text="recordIdentifier" />
              <v-data-table
                :no-data-text="$texts.text.noData"
                :no-results-text="$texts.text.noResult"
                :headers="recordHeaders"
                :items="recordData"
                :sort-by="dataTableModel.sortBy"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                v-text="$texts.text.confirm"
                @click="showPreviewDialog = false"
                text
              />
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Public from '../plugins/public'
import {
  DataTableBackup,
  DataTableHeader,
  DataTableItem,
  DataTableItems,
  DataTableModel,
  Table
} from '../interface'

type DifferenceType = 'notIncluded' | 'overIncluded' | 'value'

interface DataDifference {
  type: DifferenceType
  target: DataTableItem | null
  model: DataTableItem | null
}

export default Vue.extend({
  name: 'BackupTable',

  props: {
    dataTableModel: Object as PropType<DataTableModel>
  },

  data () {
    return {
      showDeleteDialog: false,
      showPreviewDialog: false,

      headers: [
        {
          value: 'identifier',
          text: this.$texts.header.backupTable.identifier
        },
        {
          value: 'actions',
          text: this.$texts.header.actions,
          sortable: false
        }
      ] as DataTableHeader[],

      backupIndex: -1
    }
  },

  methods: {
    restore (item: { identifier: string }) {
      this.backupIndex = this.recordItems.indexOf(item)
      const record = this.records[this.backupIndex]
      if (record) {
        this.restoreToDatabase(record.data)
        this.$store.dispatch('setDataTableData', {
          table: this.dataTableModel.tableName,
          data: [...record.data]
        })
      }
    },

    deleteBackup (item: { identifier: string }) {
      this.showDeleteDialog = true
      this.backupIndex = this.recordItems.indexOf(item)
    },

    deleteBackupConfirm () {
      this.showDeleteDialog = false
      const key = this.recordItems[this.backupIndex].identifier
      this.$store.dispatch('deleteDataTableBackup', {
        table: this.dataTableModel.tableName,
        key: key
      })
    },

    previewBackup (item: { identifier: string }) {
      this.showPreviewDialog = true
      this.backupIndex = this.recordItems.indexOf(item)
    },

    restoreToDatabase (items: DataTableItem[]) {
      const tablesData = JSON.parse(
        this.$store.getters.dataTableData
      ) as Record<Table, DataTableItems>
      const current = tablesData[this.dataTableModel.tableName] || []
      const differences = this.getDifferences([...current], [...items])

      if (differences.length === 0) {
        this.$store.dispatch('notify', {
          show: true,
          title: this.$texts.title.notification,
          content: this.$texts.text.noNeedToRestore
        })
        return
      }

      const sqls = differences.map(diff => {
        const targetItem = diff.target as unknown as (Record<string, unknown> | null)
        const modelItem = diff.model as unknown as (Record<string, unknown> | null)

        switch (diff.type) {
          case 'value':
            return Public.getUpdateSql(
              this.dataTableModel.sourceName,
              modelItem as Record<string, unknown>,
              targetItem as Record<string, unknown>,
              this.dataTableModel.keys
            )
          case 'notIncluded':
            return Public.getInsertSql(
              this.dataTableModel.sourceName,
              modelItem as Record<string, unknown>
            )
          case 'overIncluded':
            return Public.getDeleteSql(
              this.dataTableModel.sourceName,
              targetItem as Record<string, unknown>,
              this.dataTableModel.keys
            )
        }
      })

      const sql = sqls.join('; ')
      window.ipcRenderer.send('query', { type: 'restoreData', sql: sql })
    },

    getDifferences (
      target: DataTableItem[],
      model: DataTableItem[]
    ) {
      const differences = [] as DataDifference[]

      const targetMap = Public.objectArrayToMap(
        target as unknown as Record<string, string | number>[],
        this.dataTableModel.keys
      )
      const modelMap = Public.objectArrayToMap(
        model as unknown as Record<string, string | number>[],
        this.dataTableModel.keys
      )

      modelMap.forEach((modelItem, key) => {
        if (!targetMap.has(key)) {
          differences.push({
            type: 'notIncluded',
            target: null,
            model: modelItem as unknown as DataTableItem
          })
        } else {
          const targetItem = targetMap.get(key) as Record<string, string | number>
          if (this.itemAttrs.find(attr => targetItem[attr] !== modelItem[attr])) {
            differences.push({
              type: 'value',
              target: targetItem as unknown as DataTableItem,
              model: modelItem as unknown as DataTableItem
            })
          }
        }
      })

      targetMap.forEach((targetItem, key) => {
        if (!modelMap.has(key)) {
          differences.push({
            type: 'overIncluded',
            target: targetItem as unknown as DataTableItem,
            model: null
          })
        }
      })

      return differences
    }
  },

  computed: {
    records () {
      const tablesBackup = JSON.parse(
        this.$store.getters.dataTableBackup
      ) as Record<Table, DataTableBackup[]>
      const data = tablesBackup[this.dataTableModel.tableName]
      if (data) {
        return [...data]
      } else {
        return []
      }
    },

    recordItems (): { identifier: string }[] {
      return this.records.map(backup => {
        return { identifier: backup.identifier }
      })
    },

    recordData (): DataTableItem[] {
      const record = this.records[this.backupIndex]
      if (record) {
        const data = record.data as DataTableItem[]
        const converter = this.dataTableModel.converter
        return converter ? data.map(converter) : [...data]
      } else {
        return []
      }
    },

    recordIdentifier (): string {
      const record = this.records[this.backupIndex]
      if (record) {
        return record.identifier
      } else {
        return String()
      }
    },

    recordHeaderMap () {
      const tableName = this.dataTableModel.tableName as string
      const recordGroup = this.$texts.header as Record<string, unknown>
      return recordGroup[tableName] as Record<string, string>
    },

    recordHeaders () {
      return this.dataTableModel.headers.map(headerModel => {
        const header = Object.assign({}, headerModel)
        if (!header.text) {
          header.text = this.recordHeaderMap[headerModel.value]
        }
        return header
      })
    },

    itemAttrs () {
      return Object.keys(this.dataTableModel.itemModel)
    }
  }
})
</script>
