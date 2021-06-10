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
      <v-row v-if="statisticsModels">
        <v-col>
          <v-card flat outlined tile>
            <v-card-title v-text="$texts.title.visualization" />
            <v-lazy>
              <statistics :statisticsModels="statisticsModels" />
            </v-lazy>
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
import PathMap from '../plugins/pathMap'
import DataTable from './DataTable.vue'
import BackupTable from './BackupTable.vue'
import Statistics from './Statistics.vue'
import {
  AtdPathItem,
  BatchItem,
  BatchItemKey,
  DataTableModel,
  DtaPathItem,
  SecurityPointItem,
  StatisticsModel,
  StopPointItem,
  Table,
  TableSource
} from '../interface'

export default Vue.extend({
  name: 'DataSource',
  components: { DataTable, BackupTable, Statistics },

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
    },

    batchTablePathNameToText (name: string) {
      const parts = name.split('.')
      let whichType = parts[0]
      let position = parts[1]
      switch (parts[0]) {
        case 'dropOff':
          whichType = this.$texts.header.batchTableChart.dropOffNumber
          position = this.dropOffNumberToText(parts[1])
          break
        case 'security':
          whichType = this.$texts.header.batchTableChart.securityNumber
          position = this.securityNumberToText(parts[1])
          break
        case 'stand':
          whichType = this.$texts.header.batchTableChart.standNumber
          position = parts[1]
          break
      }
      return [whichType, position].join(' - ')
    },

    batchTablePointStyled (point: {
      name: string,
      value: number[]
    }): {
      name: string,
      value: number[],
      itemStyle?: { color: string | undefined },
      label?: { show: boolean }
    } {
      return {
        ...point,
        name: this.batchTablePathNameToText(point.name),
        itemStyle: {
          color: (() => {
            switch (point.name.split('.')[0]) {
              case 'dropOff': return 'royalblue'
              case 'security': return 'darkcyan'
              case 'stand': return 'purple'
              default: return undefined
            }
          })()
        },
        label: {
          show: false
        }
      }
    },

    batchTableArrowStyled (arrow: {
      source: string,
      target: string,
      batch: number[]
    }): {
      source: string,
      target: string,
      batch: number[],
      lineStyle: { color: string },
      label: { show: boolean }
    } {
      return {
        ...arrow,
        source: this.batchTablePathNameToText(arrow.source),
        target: this.batchTablePathNameToText(arrow.target),
        lineStyle: {
          color: arrow.source.split('.')[0] === 'dropOff' ? 'darkcyan' : 'purple'
        },
        label: {
          show: false
        }
      }
    },

    getPeopleNumberBy (items: BatchItem[], key: BatchItemKey) {
      const map = new Map<string, number>()
      items.forEach(item => {
        const itemValue = item[key] as string
        const num = map.get(itemValue as string)
        if (typeof (num) !== 'undefined') {
          map.set(itemValue, num + item.arrivalnum)
        } else {
          map.set(itemValue, item.arrivalnum)
        }
      })
      return map
    }
  },

  computed: {
    tableModels (): Map<Table, DataTableModel> {
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
                domain: Public.numberTextArrayFromRange(1, 44)
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
            },

            statistics: [
              {
                notMerge: false,
                renderMode: 'svg',
                option: {
                  title: {
                    text: this.$texts.header.batchTableChart.totalStandNumber
                  },
                  xAxis: {
                    type: 'category',
                    name: this.$texts.header.batchTableChart.standNumber,
                    data: Array.from(this.batchTablePeopleNumber('stand_no').keys())
                  },
                  yAxis: {
                    type: 'value',
                    name: this.$texts.header.batchTableChart.numberOfPeople
                  },
                  series: [{
                    type: 'bar',
                    showBackground: true,
                    backgroundStyle: {
                      color: 'rgba(180, 180, 180, 0.2)'
                    },
                    data: Array.from(this.batchTablePeopleNumber('stand_no').values())
                  }]
                }
              },
              {
                notMerge: false,
                renderMode: 'svg',
                option: {
                  title: {
                    text: this.$texts.header.batchTableChart.totalDropOffNumber
                  },
                  xAxis: {
                    type: 'category',
                    name: this.$texts.header.batchTableChart.dropOffNumber,
                    data: Array.from(this.batchTablePeopleNumber('dropoff_no').keys())
                      .map(key => this.dropOffNumberToText(key))
                  },
                  yAxis: {
                    type: 'value',
                    name: this.$texts.header.batchTableChart.numberOfPeople
                  },
                  series: [{
                    type: 'bar',
                    showBackground: true,
                    backgroundStyle: {
                      color: 'rgba(180, 180, 180, 0.2)'
                    },
                    data: Array.from(this.batchTablePeopleNumber('dropoff_no').values())
                  }]
                }
              },
              {
                notMerge: false,
                renderMode: 'svg',
                option: {
                  title: {
                    text: this.$texts.header.batchTableChart.totalSecurityNumber
                  },
                  xAxis: {
                    type: 'category',
                    name: this.$texts.header.batchTableChart.securityNumber,
                    data: Array.from(this.batchTablePeopleNumber('security_no').keys())
                      .map(key => this.securityNumberToText(key))
                  },
                  yAxis: {
                    type: 'value',
                    name: this.$texts.header.batchTableChart.numberOfPeople
                  },
                  series: [{
                    type: 'bar',
                    showBackground: true,
                    backgroundStyle: {
                      color: 'rgba(180, 180, 180, 0.2)'
                    },
                    data: Array.from(this.batchTablePeopleNumber('security_no').values())
                  }]
                }
              },
              {
                notMerge: true,
                renderMode: 'svg',
                option: {
                  title: {
                    text: this.$texts.header.batchTableChart.arrivalTimeline,
                    left: 12,
                    textStyle: {
                      fontWeight: 'normal',
                      fontSize: 16
                    }
                  },
                  series: [{
                    type: 'graph',
                    edgeSymbolSize: 10,
                    edgeSymbol: ['none', 'arrow'],
                    layout: 'none',
                    roam: true,
                    lineStyle: {
                      width: 2
                    },
                    edgeLabel: {
                      show: false
                    },
                    label: {
                      show: false
                    },
                    labelLayout: {
                      hideOverlap: true
                    },
                    data: [...this.batchTableTimelinePoints, ...this.batchTableTimelineMarkPoints],
                    links: this.batchTableTimelineArrows
                  }],
                  tooltip: {
                    show: true,
                    extraCssText: 'white-space: pre-wrap',
                    formatter: ({ dataType, data }: {
                      dataType: 'node' | 'edge',
                      name: string
                      data: {
                        source: string,
                        target: string
                      } | {
                        name: string,
                        value: string
                      }
                    }) => {
                      if (dataType === 'node') {
                        const info = data as { name: string, value: string }
                        return `${info.name}\n${info.value}`
                      } else {
                        return String()
                      }
                    }
                  }
                }
              },
              {
                notMerge: true,
                backgroundImage: true,
                renderMode: 'svg',
                option: {
                  title: {
                    text: this.$texts.header.batchTableChart.pathMap,
                    left: 12,
                    textStyle: {
                      fontWeight: 'normal',
                      fontSize: 16
                    }
                  },
                  grid: {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                  },
                  xAxis: { type: 'value', show: false, scale: false },
                  yAxis: { type: 'value', show: false, scale: false },
                  series: [{
                    type: 'graph',
                    coordinateSystem: 'cartesian2d',
                    symbolSize: 20,
                    edgeSymbolSize: 10,
                    edgeSymbol: ['none', 'arrow'],
                    layout: 'none',
                    lineStyle: {
                      width: 2,
                      type: 'dashed',
                      opacity: 1
                    },
                    edgeLabel: {
                      formatter: ({ data, name }) => {
                        return `${name} 波次编号: ${(data as { batch: number[] }).batch.join(', ')}`
                      }
                    },
                    data: this.batchTablePathPoints,
                    links: this.batchTablePathArrows
                  }],
                  tooltip: {
                    show: true,
                    extraCssText: 'white-space: pre-wrap',
                    formatter: ({ dataType, data }: {
                      dataType: 'node' | 'edge',
                      name: string
                      data: {
                        source: string,
                        target: string,
                        batch: number[]
                      } | {
                        name: string,
                        value: number[]
                      }
                    }) => {
                      if (dataType === 'edge') {
                        const info = data as { source: string, target: string, batch: number[] }
                        return `${info.source}\n${info.target}\n波次编号: ${info.batch.join(', ')}`
                      } else {
                        return (data as { name: string, value: number[] }).name
                      }
                    }
                  }
                }
              }
            ]
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
                domain: Public.numberTextArrayFromRange(1, 44)
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

    batchTablePeopleNumber (): (key: BatchItemKey) => Map<string, number> {
      const tablesData =
        JSON.parse(this.$store.getters.dataTableData) as Record<Table, BatchItem[]>
      const batchTableData = tablesData.batchTable
      return (key: BatchItemKey) => {
        if (batchTableData) {
          return this.getPeopleNumberBy(batchTableData, key)
        } else {
          return new Map<string, number>()
        }
      }
    },

    batchTablePaths (): (string | number)[][] {
      const tablesData =
        JSON.parse(this.$store.getters.dataTableData) as Record<Table, BatchItem[]>
      const batchTableData = tablesData.batchTable
      if (batchTableData) {
        return batchTableData.map(item => {
          return [item.dropoff_no, item.security_no, item.stand_no, item.batchno]
        })
      } else {
        return []
      }
    },

    batchTablePathPoints (): {
      name: string,
      value: number[],
      itemStyle?: { color: string | undefined },
      label?: { show: boolean }
    }[] {
      const paths = this.batchTablePaths
      const dropOffs = new Set<string>()
      const securities = new Set<string>()
      const stands = new Set<string>()

      paths.forEach(path => {
        dropOffs.add(`dropOff.${path[0]}`)
        securities.add(`security.${path[1]}`)
        stands.add(`stand.${path[2]}`)
      })

      return Array.from(dropOffs.keys())
        .concat(Array.from(securities.keys()))
        .concat(Array.from(stands.keys()))
        .map(pointName => {
          const position = PathMap.get(pointName) || { x: 0, y: 0 }
          return this.batchTablePointStyled({
            name: pointName,
            value: [position.x * 1.09, (960 - position.y) * 1.04]
          })
        })
        .concat([
          { name: 'rightTop', value: [2999, 999] },
          { name: 'leftBottom', value: [0, 0] }
        ])
    },

    batchTablePathArrows (): {
      source: string,
      target: string,
      batch: number[],
      lineStyle: { color: string },
      label: { show: boolean }
    }[] {
      const paths = this.batchTablePaths
      const arrows: {
        source: string,
        target: string,
        batch: number[],
        lineStyle: { color: string },
        label: { show: boolean }
      }[] = []

      const arrowMap = new Map<string, number[]>()

      paths.forEach(path => {
        const dropOff = `dropOff.${path[0]}`
        const security = `security.${path[1]}`
        const stand = `stand.${path[2]}`

        const atdKey = `${dropOff}>${security}`
        const dtaKey = `${security}>${stand}`

        const atdArrow = arrowMap.get(atdKey)
        const dtaArrow = arrowMap.get(dtaKey)

        if (atdArrow) {
          arrowMap.set(atdKey, atdArrow.concat(path[3] as number))
        } else {
          arrowMap.set(atdKey, [path[3] as number])
        }

        if (dtaArrow) {
          arrowMap.set(dtaKey, dtaArrow.concat(path[3] as number))
        } else {
          arrowMap.set(dtaKey, [path[3] as number])
        }
      })

      arrowMap.forEach((batch, path) => {
        const paths = path.split('>')
        arrows.push(this.batchTableArrowStyled({
          source: paths[0],
          target: paths[1],
          batch: batch
        }))
      })

      return arrows
    },

    batchTableTimelinePoints (): {
      name: string,
      value: string,
      symbolSize?: number,
      itemStyle?: { color: string }
      x: number,
      y: number,
      label?: {
        show: boolean,
        fontWeight: string,
        fontSize: number,
        formatter: ({ data }: { data: { name: string } }) => string
      }
    }[] {
      const tablesData =
        JSON.parse(this.$store.getters.dataTableData) as Record<Table, BatchItem[]>
      const batchTableData = tablesData.batchTable

      if (batchTableData) {
        const timeMap = new Map<number, number[]>()

        batchTableData.forEach(item => {
          const batches = timeMap.get(item.arrivaltime)
          if (batches) {
            timeMap.set(item.arrivaltime, batches.concat(item.batchno))
          } else {
            timeMap.set(item.arrivaltime, [item.batchno])
          }
        })

        const sorter: { time: number, batches: number[] }[] = []
        timeMap.forEach((batches, time) => {
          sorter.push({ time, batches })
        })

        sorter.sort((a, b) => a.time - b.time)
        return sorter.map((item, index) => ({
          name: `${item.time} (分钟)`,
          value: `波次编号: ${item.batches.join(', ')}`,
          symbolSize: 0,
          itemStyle: {
            color: 'gray'
          },
          label: {
            show: true,
            fontWeight: 'bold',
            fontSize: 17,
            formatter: ({ data }: {
              data: { name: string }
            }) => {
              try {
                const minutes = item.time
                const newTime = Public.timeAfterMinutes([5, 0], minutes)
                const hour = `${newTime[0]}`.padStart(2, '0')
                const minute = `${newTime[1]}`.padStart(2, '0')
                return `${hour}: ${minute}`
              } catch (error) {
                return data.name
              }
            }
          },
          x: index,
          y: 0
        }))
      } else {
        return []
      }
    },

    batchTableTimelineMarkPoints (): {
      name: string,
      value: string,
      symbolSize?: number,
      itemStyle?: { color: string }
      x: number,
      y: number,
      label?: {
        show: boolean,
        position: string,
        fontSize: number,
        formatter: ({ data }: { data: { value: string } }) => string
      }
    }[] {
      return this.batchTableTimelinePoints.map((point, index) => {
        const isEven = !(index % 2)
        return {
          ...point,
          name: `到达时间: ${point.name}`,
          y: isEven ? point.y - 0.8 : point.y + 0.8,
          symbolSize: 25,
          itemStyle: {
            color: 'royalblue'
          },
          label: {
            show: true,
            fontSize: 15,
            position: isEven ? 'top' : 'bottom',
            formatter: ({ data }: {
              data: { value: string }
            }) => {
              return data.value
            }
          }
        }
      })
    },

    batchTableTimelineArrows (): {
      source: number,
      target: number,
      lineStyle?: { type: string, color: string }
    }[] {
      const arrows: {
        source: number,
        target: number,
        lineStyle?: { type: string, color: string }
      }[] = []
      this.batchTableTimelinePoints.forEach((point, index, arr) => {
        if (index !== arr.length - 1) {
          arrows.push({
            source: index,
            target: index + 1
          })
        }
      })

      this.batchTableTimelineMarkPoints.forEach((point, index, arr) => {
        arrows.push({
          source: index,
          target: arr.length + index,
          lineStyle: {
            type: 'dashed',
            color: 'royalblue'
          }
        })
      })

      return arrows
    },

    dataTableModel (): DataTableModel {
      return this.tableModels.get(this.table) || Object()
    },

    statisticsModels (): StatisticsModel[] | undefined {
      return this.dataTableModel.statistics
    },

    sourceTable (): TableSource {
      return this.tableModels.get(this.table)?.sourceName || 'invalid'
    },

    invertedDropOffMap (): Map<string, string> {
      return Public.invertKeyValues(DropOffMap) as Map<string, string>
    },

    invertedSecurityMap (): Map<string, string> {
      return Public.invertKeyValues(SecurityMap) as Map<string, string>
    }
  },

  created () {
    this.fetchFromDatabase()
  }
})
</script>
