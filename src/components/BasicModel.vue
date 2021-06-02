<template>
  <div style="flex: 1; position: relative; overflow: auto;">
    <v-container style="position: absolute; min-width: 400px;" fluid>
      <v-row>
        <v-col>
          <v-card flat outlined tile>
            <v-card-text>
              <v-form v-model="valid">
                <v-container>
                  <v-row>
                    <v-col cols="6">
                      <v-select
                        v-model="selectBatches.value"
                        :no-data-text="$texts.text.noData"
                        :label="selectBatches.label"
                        :items="selectBatches.domain"
                        multiple
                        dense
                      />
                    </v-col>
                    <v-col>
                      <v-btn
                        class="mr-1"
                        color="primary"
                        v-text="$texts.text.selectAll"
                        @click="selectAllBatches"
                        text tile
                      />
                      <v-btn
                        class="mr-1"
                        color="primary"
                        v-text="$texts.text.invertSelect"
                        @click="invertSelectedBatches"
                        text tile
                      />
                      <v-btn
                        color="primary"
                        v-text="$texts.text.deselectAll"
                        @click="deselectAllBatches"
                        text tile
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="initialSpeed.value"
                        :label="initialSpeed.label"
                        :rules="initialSpeed.rules"
                        dense
                        required
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="preferredSpeed.value"
                        :label="preferredSpeed.label"
                        :rules="preferredSpeed.rules"
                        dense
                        required
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model.number="recordPointInterval.value"
                        :label="recordPointInterval.label"
                        :rules="recordPointInterval.rules"
                        dense
                        required
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model.number="writeCsvInterval.value"
                        :label="writeCsvInterval.label"
                        :rules="writeCsvInterval.rules"
                        dense
                        required
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model.number="numberOfPeople.value"
                        :label="numberOfPeople.label"
                        :rules="numberOfPeople.rules"
                        dense
                        required
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Public from '../plugins/public'
import { BasicModel, FormItem } from '../interface'

export default Vue.extend({
  name: 'BasicModel',

  data () {
    return {
      valid: false,
      dataFetched: false,
      dataInputTimer: -1,
      sourceName: 'settings',

      selectBatches: {
        label: this.$texts.header.basicModel.selectBatches,
        value: [] as number[],
        domain: Public.numberArrayFromRange(1, 233)
      } as FormItem,

      initialSpeed: {
        label: this.$texts.header.basicModel.initialSpeed,
        value: '0',
        rules: [
          speed => !!String(speed) || this.$texts.text.emptyNotAllowed,
          speed => Public.isNonnegativeFloatOrUniform(
            speed as string
          ) || this.$texts.text.negativeFloatOrNonUniformNotAllowed
        ]
      } as FormItem,

      preferredSpeed: {
        label: this.$texts.header.basicModel.preferredSpeed,
        value: '0',
        rules: [
          speed => !!String(speed) || this.$texts.text.emptyNotAllowed,
          speed => Public.isNonnegativeFloatOrUniform(
            speed as string
          ) || this.$texts.text.negativeFloatOrNonUniformNotAllowed
        ]
      } as FormItem,

      recordPointInterval: {
        label: this.$texts.header.basicModel.recordPointInterval,
        value: 3,
        rules: [
          time => !!String(time) || this.$texts.text.emptyNotAllowed,
          time => Public.isPositiveInt(
            time as string | number
          ) || this.$texts.text.nonPositiveIntNotAllowed
        ]
      } as FormItem,

      writeCsvInterval: {
        label: this.$texts.header.basicModel.writeCsvInterval,
        value: 1000,
        rules: [
          time => !!String(time) || this.$texts.text.emptyNotAllowed,
          time => Public.isPositiveInt(
            time as string | number
          ) || this.$texts.text.nonPositiveIntNotAllowed
        ]
      } as FormItem,

      numberOfPeople: {
        label: this.$texts.header.basicModel.numberOfPeople,
        value: 0,
        rules: [
          people => !!String(people) || this.$texts.text.emptyNotAllowed,
          people => Public.isPositiveInt(
            people as string | number
          ) || this.$texts.text.nonPositiveIntNotAllowed
        ]
      } as FormItem,

      lastValidData: null as BasicModel | null
    }
  },

  methods: {
    selectAllBatches () {
      const domain = this.selectBatches.domain as number[]
      this.selectBatches.value = [...domain]
    },

    invertSelectedBatches () {
      const domain = this.selectBatches.domain as number[]
      const selectedSet = new Set(this.selectBatches.value as number[])
      this.selectBatches.value = [
        ...domain.filter(value => !selectedSet.has(value))
      ]
    },

    deselectAllBatches () {
      this.selectBatches.value = []
    },

    fetchFromDatabase () {
      window.ipcRenderer.send('query', {
        type: 'getTableData',
        sql: `select * from ${this.sourceName}`
      })
    },

    updateToDatabase (newItem: BasicModel) {
      if (this.lastValidData) {
        const sql = Public.getUpdateSql(
          this.sourceName,
          Object.assign({}, newItem) as unknown as Record<string, unknown>,
          Object.assign({}, this.lastValidData) as unknown as Record<string, unknown>,
          ['selected_batches']
        )
        window.ipcRenderer.send('query', { type: 'updateData', sql: sql })
      }
    },

    checkItemModel (a: BasicModel, b: BasicModel) {
      return Public.isObjectEqualType(
        a as unknown as Record<string, unknown>,
        b as unknown as Record<string, unknown>
      )
    },

    onQueryResult (_event: unknown, { type, results }: {
      type: string,
      results: Record<string, unknown>[],
      field: Record<string, unknown>[]
    }) {
      if (type === 'getVersion') {
        if (!this.dataFetched) {
          this.fetchFromDatabase()
        }
      }
      if (type === 'getTableData') {
        if (results.length === 0) { return }
        if (this.dataFetched) { return }

        this.dataFetched = false
        if (this.checkItemModel(
          this.basicModelData,
          results[0] as unknown as BasicModel
        )) {
          this.basicModelData = results[0] as unknown as BasicModel
          this.$nextTick(() => {
            this.dataFetched = true
          })
        } else {
          const receivedType = Public.objectTypeInfo(results[0])
          const supposedType = Public.objectTypeInfo(
            this.basicModelData as unknown as Record<string, unknown>
          )
          this.$store.dispatch('notify', {
            show: true,
            title: this.$texts.title.error,
            content: `${this.$texts.text.dataModelNotMatch},\n数据表格式:\n${supposedType},\n数据源格式:\n${receivedType}`
          })
        }
      }
    },

    attachEvents () {
      window.ipcRenderer.on('queryResult', this.onQueryResult)
    },

    detachEvents () {
      window.ipcRenderer.removeListener('queryResult', this.onQueryResult)
    }
  },

  computed: {
    selectedBatchesStr: {
      get (): string {
        const values = [...(this.selectBatches.value as number[])]
        return values.length === 0 ? String() : values.sort((a, b) => a - b).join(',')
      },

      set (value: string) {
        this.selectBatches.value = value.split(',').map(str => parseInt(str))
      }
    },

    basicModelData: {
      get (): BasicModel {
        return {
          selected_batches: this.selectedBatchesStr,
          initial_speed: this.initialSpeed.value as string,
          preferred_speed: this.preferredSpeed.value as string,
          record_point_interval: this.recordPointInterval.value as number,
          write_csv_interval: this.writeCsvInterval.value as number,
          number_of_people: this.numberOfPeople.value as number
        }
      },

      set (value: BasicModel) {
        this.selectedBatchesStr = value.selected_batches
        this.initialSpeed.value = value.initial_speed
        this.preferredSpeed.value = value.preferred_speed
        this.recordPointInterval.value = value.record_point_interval
        this.writeCsvInterval.value = value.write_csv_interval
        this.numberOfPeople.value = value.number_of_people
      }
    }
  },

  watch: {
    basicModelData (newItem: BasicModel) {
      if (this.dataFetched) {
        if (this.dataInputTimer !== -1) {
          window.clearTimeout(this.dataInputTimer)
        }
        this.dataInputTimer = window.setTimeout(() => {
          if (this.valid && newItem.selected_batches.length !== 0) {
            this.updateToDatabase(newItem)
            this.lastValidData = Object.assign({}, newItem)
            this.$store.dispatch('snackNotify', {
              show: true,
              content: this.$texts.text.databaseUpdated
            })
          }
        }, 2000)
      } else {
        this.lastValidData = Object.assign({}, newItem)
      }
      this.$store.dispatch('setBasicModelData', newItem)
    }
  },

  created () {
    this.attachEvents()
    this.fetchFromDatabase()
  },

  beforeDestroy () {
    this.detachEvents()
  }
})
</script>
