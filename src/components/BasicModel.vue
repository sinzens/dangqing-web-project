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
                        v-model.number="initialSpeed.value"
                        :label="initialSpeed.label"
                        :rules="initialSpeed.rules"
                        dense
                        required
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model.number="preferredSpeed.value"
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
import { FormItem } from '../interface'

export default Vue.extend({
  name: 'BasicModel',

  data () {
    return {
      valid: false,

      selectBatches: {
        label: this.$texts.header.basicModel.selectBatches,
        value: [] as number[],
        domain: Public.numberArrayFromRange(1, 233)
      } as FormItem,

      initialSpeed: {
        label: this.$texts.header.basicModel.initialSpeed,
        value: 0,
        rules: [
          speed => !!String(speed) || this.$texts.text.emptyNotAllowed,
          speed => Public.isNonnegativeFloat(
            speed as string | number
          ) || this.$texts.text.negativeFloatNotAllowed
        ]
      } as FormItem,

      preferredSpeed: {
        label: this.$texts.header.basicModel.preferredSpeed,
        value: 0,
        rules: [
          speed => !!String(speed) || this.$texts.text.emptyNotAllowed,
          speed => Public.isNonnegativeFloat(
            speed as string | number
          ) || this.$texts.text.negativeFloatNotAllowed
        ]
      } as FormItem,

      recordPointInterval: {
        label: this.$texts.header.basicModel.recordPointInterval,
        value: 0,
        rules: [
          time => !!String(time) || this.$texts.text.emptyNotAllowed,
          time => Public.isPositiveInt(
            time as string | number
          ) || this.$texts.text.nonPositiveIntNotAllowed
        ]
      } as FormItem,

      writeCsvInterval: {
        label: this.$texts.header.basicModel.writeCsvInterval,
        value: 0,
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
      } as FormItem
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
    }
  },

  computed: {
    selectedBatchesStr (): string {
      return (
        this.selectBatches.value as number[]
      ).sort((a, b) => a - b).join(',')
    },

    basicModelData (): Record<string, unknown> {
      return {
        selectedBatches: this.selectedBatchesStr,
        initialSpeed: this.initialSpeed.value,
        preferredSpeed: this.preferredSpeed.value,
        recordPointInterval: this.recordPointInterval.value,
        writeCsvInterval: this.writeCsvInterval.value,
        numberOfPeople: this.numberOfPeople.value
      }
    }
  },

  watch: {
    basicModelData (value) {
      this.$store.dispatch('setBasicModelData', value)
    }
  }
})
</script>
