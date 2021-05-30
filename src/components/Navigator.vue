<template>
  <div style="flex: 1;">
    <v-navigation-drawer id="navigator" width="100%" permanent>
      <v-list-item style="user-select: none;" dense>
        <v-list-item-icon>
          <v-icon v-text="'mdi-navigation'" />
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title class="subtitle-1" v-text="$texts.title.navigator" />
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <v-list dense>
        <v-list-item-group color="indigo" v-model="navigateIndex">
          <v-list-item v-for="item in items" :key="item.key" link>
            <v-list-item-icon>
              <v-icon v-text="item.icon" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.header" />
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Page, TabItem } from '../interface'

interface NavigationItem {
  header: string
  icon: string
  key: Page
}

export default Vue.extend({
  name: 'Navigator',

  data () {
    return {
      items: [
        {
          header: this.$texts.header.navigator.basicModel,
          icon: 'mdi-view-dashboard',
          key: 'basicModel'
        },
        {
          header: this.$texts.header.navigator.batchTable,
          icon: 'mdi-table',
          key: 'batchTable'
        },
        {
          header: this.$texts.header.navigator.atdTable,
          icon: 'mdi-table',
          key: 'atdTable'
        },
        {
          header: this.$texts.header.navigator.dtaTable,
          icon: 'mdi-table',
          key: 'dtaTable'
        }
      ] as NavigationItem[]
    }
  },

  computed: {
    navigateIndex: {
      get () {
        const tabs = this.$store.getters.openingTabs as TabItem[]
        const currentTabIndex = this.$store.getters.currentTab
        const currentTab = tabs[currentTabIndex]
        if (currentTab) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (this as any).items.findIndex((item: NavigationItem) => {
            return item.key === currentTab.page
          })
        } else {
          return undefined
        }
      },

      set (value: number) {
        if (typeof (value) === 'undefined') { return }

        const selectedPage = this.items[value]
        this.$store.dispatch('pushTab', {
          header: selectedPage.header,
          page: selectedPage.key
        } as TabItem)
      }
    }
  },

  created () {
    this.navigateIndex = 0
  }
})
</script>

<style lang="scss">
#navigator {
  .v-navigation-drawer__border {
    top: unset;
    bottom: 0;
    height: calc(100% - 40px);
  }
}
</style>
