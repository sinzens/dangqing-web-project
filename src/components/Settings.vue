<template>
  <div style="flex: 1; position: relative; overflow: auto;">
    <v-container style="position: absolute;" fluid>
      <v-row v-for="groupName in Object.keys(settingsModel)" :key="groupName">
        <v-col>
          <v-card flat outlined tile>
            <v-card-title class="subtitle-1" v-text="settingLabel(groupName)" />
            <v-card-text>
              <v-list dense>
                <v-list-item
                  v-for="itemName in Object.keys(settingsModel[groupName])"
                  :key="itemName"
                >
                  <v-list-item-content>
                    <v-container>
                      <v-row align="center">
                        <v-col class="pa-0" cols="3">
                          <span v-text="settingLabel(itemName)" />
                        </v-col>
                        <v-col class="pa-0">
                          <v-text-field
                            v-if="typeof (settingsModel[groupName][itemName]) === 'number'"
                            v-model.number="settingValues[groupName][itemName]"
                            hide-details
                            dense
                          />
                          <v-text-field
                            v-else
                            v-model="settingValues[groupName][itemName]"
                            hide-details
                            dense
                          />
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Settings',

  data () {
    return {
      settingValues: Object(),

      settingsModel: {
        database: {
          host: 'rm-uf64u9qj410or7qhgto.mysql.rds.aliyuncs.com',
          user: 'user',
          password: 'Qwer123!',
          database: 'database_test',
          connectTimeout: 5000
        }
      }
    }
  },

  methods: {
    settingLabel (key: string) {
      return (this.$texts.text.settings as Record<string, string>)[key]
    }
  },

  computed: {
    settingsLoaded (): Record<string, unknown> {
      const configStr = this.$store.getters.config as string
      try {
        return JSON.parse(configStr)
      } catch (error) {
        return this.settingsModel
      }
    }
  },

  watch: {
    settingValues: {
      handler (value) {
        this.$store.dispatch('setEditedConfig', JSON.stringify(value))
      },
      deep: true
    }
  },

  created () {
    this.settingValues = this.settingsLoaded
  }
})
</script>
