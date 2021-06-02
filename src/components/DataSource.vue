<template>
  <div style="flex: 1; position: relative; overflow: auto;">
    <v-container style="position: absolute; min-width: 700px;" fluid>
      <v-row>
        <v-col>
          <v-card flat outlined tile>
            <data-table :dataTableModel="dataTableModel" editable />
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card flat outlined tile>
            <backup-table :dataTableModel="dataTableModel" />
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import Public from '../plugins/public'
import DropOffMap from '../plugins/dropOffMap'
import SecurityMap from '../plugins/securityMap'
import DataTable from './DataTable.vue'
import BackupTable from './BackupTable.vue'
import {
  AtdPathItem,
  BatchItem,
  DataTableModel,
  DtaPathItem,
  SecurityPointItem,
  StopPointItem,
  Table,
  TableSource
} from '../interface'

export default Vue.extend({
  name: 'DataSource',
  components: { DataTable, BackupTable },

  props: {
    table: String as PropType<Table>
  },

  methods: {
    fetchFromDatabase () {
      window.ipcRenderer.send('query', {
        type: 'getTableData',
        sql: `select * from ${this.sourceTable}`
      })
    },

    dropOffNumberToText (num: string) {
      return DropOffMap.get(num) || this.$texts.text.unknown
    },

    securityNumberToText (num: string) {
      return SecurityMap.get(num) || this.$texts.text.unknown
    },

    dropOffTextToNumber (text: string) {
      return this.invertedDropOffMap.get(text) || this.$texts.text.unknown
    },

    securityTextToNumber (text: string) {
      return this.invertedSecurityMap.get(text) || this.$texts.text.unknown
    }
  },

  computed: {
    tableModels () {
      return new Map<Table, DataTableModel>([
        [
          'batchTable', {
            headers: [
              {
                value: 'batchno',
                inputType: 'select',
                domain: Public.numberArrayFromRange(1, 233)
              },
              {
                value: 'arrivaltime',
                inputType: 'input',
                valueType: 'number'
              },
              {
                value: 'arrivalnum',
                inputType: 'input',
                valueType: 'number'
              },
              {
                value: 'dropoff_no',
                inputType: 'select',
                domain: Array.from(DropOffMap.values())
              },
              {
                value: 'stand_no',
                inputType: 'select',
                domain: Public.numberTextArrayFromRange(1, 48)
              },
              {
                value: 'security_no',
                inputType: 'select',
                domain: Array.from(SecurityMap.values())
              },
              {
                value: 'sc_capacity',
                inputType: 'input',
                valueType: 'number'
              }
            ],

            itemModel: {
              batchno: 1,
              arrivaltime: 0,
              arrivalnum: 0,
              dropoff_no: '01',
              stand_no: '1',
              security_no: '01',
              sc_capacity: 100
            } as BatchItem,

            keys: ['batchno'],

            sortBy: 'batchno',
            tableName: 'batchTable',
            sourceName: 'batch',
            invalidInfo: this.$texts.text.dropOffNoSecurityNoInvalid,

            converter: (item_: BatchItem) => {
              const item = Object.assign({}, item_)
              item.dropoff_no = this.dropOffNumberToText(item.dropoff_no)
              item.security_no = this.securityNumberToText(item.security_no)
              return item
            },

            invertConverter: (item_: BatchItem) => {
              const item = Object.assign({}, item_)
              item.dropoff_no = this.dropOffTextToNumber(item.dropoff_no)
              item.security_no = this.securityTextToNumber(item.security_no)
              return item
            },

            validate: (item: BatchItem) => {
              const { results } = window.ipcRenderer.sendSync('querySync', {
                type: 'getTableData',
                sql: `select * from path_1 where dropoff_no = ${item.dropoff_no} and security_no = ${item.security_no}`
              })
              if (results) {
                return (results as unknown[]).length !== 0
              } else {
                return false
              }
            }
          } as DataTableModel
        ],

        [
          'atdTable', {
            headers: [
              {
                value: 'dropoff_no',
                inputType: 'select',
                domain: Array.from(DropOffMap.values())
              },
              { value: 'name', inputType: 'input' },
              {
                value: 'security_no',
                inputType: 'select',
                domain: Array.from(SecurityMap.values())
              },
              { value: 'path', inputType: 'input' }
            ],

            itemModel: {
              dropoff_no: '01',
              name: '',
              security_no: '01',
              path: ''
            } as AtdPathItem,

            keys: ['dropoff_no', 'security_no'],

            sortBy: 'dropoff_no',
            tableName: 'atdTable',
            sourceName: 'path_1',

            converter: (item_: AtdPathItem) => {
              const item = Object.assign({}, item_)
              item.dropoff_no = this.dropOffNumberToText(item.dropoff_no)
              item.security_no = this.securityNumberToText(item.security_no)
              return item
            },

            invertConverter: (item_: AtdPathItem) => {
              const item = Object.assign({}, item_)
              item.dropoff_no = this.dropOffTextToNumber(item.dropoff_no)
              item.security_no = this.securityTextToNumber(item.security_no)
              return item
            }
          } as DataTableModel
        ],

        [
          'dtaTable', {
            headers: [
              {
                value: 'name',
                inputType: 'input',
                sort: (a: string, b: string) => {
                  return (
                    Public.takeNumberFromString(a) - Public.takeNumberFromString(b)
                  )
                }
              },
              { value: 'content', inputType: 'input' },
              {
                value: 'security_no',
                inputType: 'select',
                domain: Array.from(SecurityMap.values())
              },
              {
                value: 'stand_no',
                inputType: 'select',
                domain: Public.numberTextArrayFromRange(1, 48)
              },
              { value: 'path', inputType: 'input' }
            ],

            itemModel: {
              name: '',
              content: '',
              security_no: '01',
              stand_no: '1',
              path: ''
            } as DtaPathItem,

            keys: ['name'],

            sortBy: 'name',
            tableName: 'dtaTable',
            sourceName: 'path_2',

            converter: (item_: DtaPathItem) => {
              const item = Object.assign({}, item_)
              item.security_no = this.securityNumberToText(item.security_no)
              return item
            },

            invertConverter: (item_: DtaPathItem) => {
              const item = Object.assign({}, item_)
              item.security_no = this.securityTextToNumber(item.security_no)
              return item
            }
          } as DataTableModel
        ],

        [
          'stopTable', {
            headers: [
              {
                value: 'area',
                inputType: 'select',
                domain: Array.from(DropOffMap.values())
              },
              { value: 'name', inputType: 'input' },
              {
                value: 'p_minvalue',
                inputType: 'input',
                valueType: 'number'
              },
              {
                value: 'p_maxvalue',
                inputType: 'input',
                valueType: 'number'
              },
              {
                value: 'dropoff_way',
                inputType: 'select',
                domain: Public.numberArrayFromRange(0, 1)
              },
              {
                value: 'delta',
                inputType: 'input',
                valueType: 'number'
              }
            ],

            itemModel: {
              area: '01',
              name: '',
              p_minvalue: 5,
              p_maxvalue: 10,
              dropoff_way: 0,
              delta: 0
            } as StopPointItem,

            keys: ['area'],

            sortBy: 'area',
            tableName: 'stopTable',
            sourceName: 'stop_point',

            converter: (item_: StopPointItem) => {
              const item = Object.assign({}, item_)
              item.area = this.dropOffNumberToText(item.area)
              return item
            },

            invertConverter: (item_: StopPointItem) => {
              const item = Object.assign({}, item_)
              item.area = this.dropOffTextToNumber(item.area)
              return item
            }
          } as DataTableModel
        ],

        [
          'securityTable', {
            headers: [
              {
                value: 'area',
                inputType: 'select',
                domain: Array.from(SecurityMap.values())
              },
              { value: 'name', inputType: 'input' },
              {
                value: 'p_minvalue',
                inputType: 'input',
                valueType: 'number'
              },
              {
                value: 'p_maxvalue',
                inputType: 'input',
                valueType: 'number'
              }
            ],

            itemModel: {
              area: '01',
              name: '',
              p_minvalue: 5,
              p_maxvalue: 10
            } as SecurityPointItem,

            keys: ['area'],

            sortBy: 'area',
            tableName: 'securityTable',
            sourceName: 'security_point',

            converter: (item_: SecurityPointItem) => {
              const item = Object.assign({}, item_)
              item.area = this.securityNumberToText(item.area)
              return item
            },

            invertConverter: (item_: SecurityPointItem) => {
              const item = Object.assign({}, item_)
              item.area = this.securityTextToNumber(item.area)
              return item
            }
          } as DataTableModel
        ]
      ])
    },

    dataTableModel (): DataTableModel {
      return this.tableModels.get(this.table) || Object()
    },

    sourceTable (): TableSource {
      return this.tableModels.get(this.table)?.sourceName || 'invalid'
    },

    invertedDropOffMap () {
      return Public.invertKeyValues(DropOffMap) as Map<string, string>
    },

    invertedSecurityMap () {
      return Public.invertKeyValues(SecurityMap) as Map<string, string>
    }
  },

  created () {
    this.fetchFromDatabase()
  }
})
</script>
