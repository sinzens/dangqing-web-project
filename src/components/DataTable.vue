<template>
  <v-data-table
    :no-data-text="$texts.text.noData"
    :no-results-text="$texts.text.noResult"
    :loading-text="$texts.text.loading"
    :headers="headers"
    :items="items"
    :sort-by="sortBy"
    :search="searchedValue"
    :custom-filter="dataFilter"
    :loading="loading"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-select
          class="mr-5"
          v-model="searchedHeader"
          :no-data-text="$texts.text.noData"
          :items="headerTexts"
          hide-details
          dense
        />
        <v-select
          class="mr-5"
          color="indigo"
          v-model="searchRule"
          :no-data-text="$texts.text.noData"
          :items="searchRules"
          hide-details
          dense
        />
        <v-text-field
          class="mr-5"
          v-model="searchedValue"
          hide-details
          dense
        />
        <v-divider />
        <v-spacer />
        <v-dialog v-model="showEditDialog" max-width="50%" persistent>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              v-on="on"
              v-bind="attrs"
              v-text="$texts.text.newDataItem"
              text
              tile
            />
          </template>
          <v-card tile>
            <v-card-title v-text="$texts.title.editDataItem" />
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="6"
                    v-for="(header, index) in dataTableModel.headers"
                    :key="`${dataTableModel.tableName}.${header.value}`"
                  >
                    <template v-if="header.inputType === 'input'">
                      <v-text-field
                        v-model.number="editedItem[header.value]"
                        :label="headerTexts[index]"
                        :rules="header.rules"
                        v-if="header.valueType === 'number'"
                        dense
                      />
                      <v-text-field
                        v-model="editedItem[header.value]"
                        :label="headerTexts[index]"
                        :rules="header.rules"
                        v-else
                        dense
                      />
                    </template>
                    <v-select
                      v-model="editedItem[header.value]"
                      :items="header.domain"
                      :label="headerTexts[index]"
                      :no-data-text="$texts.text.noData"
                      v-else-if="header.inputType === 'select'"
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-alert
                    type="error"
                    v-text="invalidInfo"
                    v-show="invalidInfo.length !== 0"
                    tile
                  />
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                v-text="$texts.text.cancel"
                @click="closeEditDialog"
                text
              />
              <v-btn
                color="primary"
                :loading="confirmingEdit"
                v-text="$texts.text.save"
                @click="saveEdit"
                text
              />
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="showDeleteDialog" max-width="50%" persistent>
          <v-card tile>
            <v-card-title v-text="$texts.title.deleteDataItem" />
            <v-card-text v-text="$texts.text.deleteDataItemConfirm" />
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                v-text="$texts.text.cancel"
                @click="closeDeleteDialog"
                text
              />
              <v-btn
                color="primary"
                v-text="$texts.text.confirm"
                @click="deleteItemConfirm"
                text
              />
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon
        small
        class="mr-2"
        v-text="'mdi-pencil'"
        @click="editItem(item)"
      />
      <v-icon
        small
        v-text="'mdi-delete'"
        @click="deleteItem(item)"
      />
    </template>
  </v-data-table>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Public from '../plugins/public'
import {
  DataTableHeader,
  DataTableItem,
  DataTableItems,
  DataTableModel,
  Table
} from '../interface'

export default Vue.extend({
  name: 'DataTable',

  props: {
    dataTableModel: Object as PropType<DataTableModel>,
    editable: Boolean
  },

  data () {
    return {
      showEditDialog: false,
      showDeleteDialog: false,
      dataFetched: false,
      loading: true,
      confirmingEdit: false,

      invalidInfo: String(),

      searchedHeader: String(),
      searchedValue: String(),
      searchRule: this.$texts.header.searchRule.equal,
      searchRules: [
        this.$texts.header.searchRule.smaller,
        this.$texts.header.searchRule.equal,
        this.$texts.header.searchRule.larger,
        this.$texts.header.searchRule.smallerEqual,
        this.$texts.header.searchRule.largerEqual
      ],

      defaultItem: this.dataTableModel.converter
        ? this.dataTableModel.converter(this.dataTableModel.itemModel)
        : this.dataTableModel.itemModel,
      editedItem: this.dataTableModel.converter
        ? this.dataTableModel.converter(this.dataTableModel.itemModel)
        : this.dataTableModel.itemModel,
      editedIndex: -1,

      innerItems: [] as DataTableItem[]
    }
  },

  methods: {
    onQueryResult (_event: unknown, { type, results }: {
      type: string,
      results: Record<string, unknown>[],
      field: Record<string, unknown>[]
    }) {
      if (type === 'getTableData') {
        this.dataFetched = false
        this.loading = false
        if (this.checkItemModel(
          this.dataTableModel.itemModel,
          results[0] as unknown as DataTableItem
        )) {
          this.innerItems = [...results] as unknown as DataTableItems
          this.$nextTick(() => {
            this.dataFetched = true
          })
        }
      }
    },

    dataFilter (
      _value: number,
      search: string | null,
      item: Record<string, unknown>
    ) {
      if (!search) { return true }
      if (this.searchedHeader.length === 0) { return true }

      const header = this.headerMapInverted[this.searchedHeader]
      const itemValue = item[header]

      let itemValueText: string | number
      if (typeof (itemValue) === 'number') {
        itemValueText = itemValue as number
      } else {
        itemValueText = itemValue as string
      }

      const searchRules = this.$texts.header.searchRule
      switch (this.searchRule) {
        case searchRules.smaller:
          return itemValueText < search
        case searchRules.equal:
          return itemValueText.toString() === search
        case searchRules.larger:
          return itemValueText > search
        case searchRules.smallerEqual:
          return itemValueText <= search
        case searchRules.largerEqual:
          return itemValueText >= search
        default:
          return true
      }
    },

    editItem (item: DataTableItem) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.showEditDialog = true
    },

    deleteItem (item: DataTableItem) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.showDeleteDialog = true
    },

    deleteItemConfirm () {
      const deleted = this.innerItems.splice(this.editedIndex, 1)
      this.deleteItemToDatabase(deleted[0])
      this.closeDeleteDialog()
    },

    closeEditDialog () {
      this.showEditDialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDeleteDialog () {
      this.showDeleteDialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    saveEdit () {
      const converter = this.dataTableModel.invertConverter
      const editedItem = Object.assign({}, this.editedItem)
      if (converter) {
        Object.assign(editedItem, converter(this.editedItem))
      }

      this.confirmingEdit = true
      const validate = this.dataTableModel.validate
      if ((validate && validate(editedItem)) || !validate) {
        if (this.editedIndex > -1) {
          const beforeEdited = Object.assign({}, this.innerItems[this.editedIndex])
          this.$set(this.innerItems, this.editedIndex, editedItem)
          this.updateItemToDatabase(editedItem, beforeEdited)
        } else {
          this.innerItems.push(editedItem)
          this.insertItemToDatabase(editedItem)
        }
        this.invalidInfo = String()
        this.closeEditDialog()
      } else {
        this.invalidInfo = this.dataTableModel.invalidInfo || String()
      }
      this.confirmingEdit = false
    },

    insertItemToDatabase (item: DataTableItem) {
      const values = Object.values(item).map(value => `'${value}'`)
      const valuesStr = values.join(', ')
      const sql = `insert into ${this.dataTableModel.sourceName} values (${valuesStr})`
      window.ipcRenderer.send('query', { type: 'insertData', sql: sql })
    },

    updateItemToDatabase (
      newItem_: DataTableItem,
      oldItem_: DataTableItem
    ) {
      const newItem = newItem_ as unknown as Record<string, unknown>
      const oldItem = oldItem_ as unknown as Record<string, unknown>
      const values = Object.keys(newItem).map(key => `${key} = '${newItem[key]}'`)
      const conditions = this.dataTableModel.keys.map(key => `${key} = '${oldItem[key]}'`)
      const valuesStr = values.join(', ')
      const conditionsStr = conditions.join(' and ')
      const sql = `update ${this.dataTableModel.sourceName} set ${valuesStr} where ${conditionsStr}`
      window.ipcRenderer.send('query', { type: 'updateData', sql: sql })
    },

    deleteItemToDatabase (item_: DataTableItem) {
      const item = item_ as unknown as Record<string, unknown>
      const conditions = this.dataTableModel.keys.map(key => `${key} = '${item[key]}'`)
      const conditionsStr = conditions.join(' and ')
      const sql = `delete from ${this.dataTableModel.sourceName} where ${conditionsStr}`
      window.ipcRenderer.send('query', { type: 'deleteData', sql: sql })
    },

    checkItemModel (a: DataTableItem, b: DataTableItem) {
      return Public.isObjectEqualType(
        a as unknown as Record<string, unknown>,
        b as unknown as Record<string, unknown>
      )
    },

    attachEvents () {
      window.ipcRenderer.on('queryResult', this.onQueryResult)
    },

    detachEvents () {
      window.ipcRenderer.removeListener('queryResult', this.onQueryResult)
    }
  },

  computed: {
    headerMap (): Record<string, string> {
      const tableName = this.dataTableModel.tableName as string
      const recordGroup = this.$texts.header as Record<string, unknown>
      return recordGroup[tableName] as Record<string, string>
    },

    headerMapInverted (): Record<string, string> {
      return Public.invertKeyValues(this.headerMap) as Record<string, string>
    },

    headers (): DataTableHeader[] {
      const modelHeaders = this.dataTableModel.headers
      const headers = modelHeaders ? [...modelHeaders] : []
      if (headers.length !== 0 && this.editable) {
        headers.push({ value: 'actions', sortable: false })
      }

      return headers.map(headerModel => {
        const header = Object.assign({}, headerModel)
        if (!header.text) {
          if (header.value === 'actions') {
            header.text = this.$texts.header.actions
          } else {
            header.text = this.headerMap[headerModel.value]
          }
        }
        return header
      })
    },

    headerTexts (): string[] {
      return this.headers.filter(header => {
        return header.value !== 'actions'
      }).map(header => {
        return header.text || String()
      })
    },

    items (): DataTableItem[] {
      const tablesData = JSON.parse(
        this.$store.getters.dataTableData
      ) as Record<Table, DataTableItems>
      const data = tablesData[this.dataTableModel.tableName]
      if (data) {
        const converter = this.dataTableModel.converter
        return converter ? (data as DataTableItem[]).map(converter) : data
      } else {
        return []
      }
    },

    innerItemsStr (): string {
      return JSON.stringify(this.innerItems)
    },

    sortBy () {
      const model = this.dataTableModel as DataTableModel
      return model.sortBy || String()
    }
  },

  watch: {
    innerItemsStr (newValue: string, oldValue: string) {
      if (this.loading) { this.loading = false }

      const newItems = JSON.parse(newValue) as DataTableItems
      this.$store.dispatch('setDataTableData', {
        table: this.dataTableModel.tableName,
        data: [...newItems]
      })

      if (this.dataFetched) {
        const oldItems = JSON.parse(oldValue) as DataTableItems
        this.$store.dispatch('addDataTableBackup', {
          table: this.dataTableModel.tableName,
          key: new Date().toString(),
          data: [...oldItems]
        })
      }
    }
  },

  created () {
    this.attachEvents()
  },

  beforeDestroy () {
    this.detachEvents()
  }
})
</script>
