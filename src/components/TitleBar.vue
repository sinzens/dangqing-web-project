<template>
  <v-container
    class="pa-0 fill-height"
    style="align-items: stretch; user-select: none;"
    fluid
  >
    <v-row class="ma-0 pa-0 fill-height">
      <v-col class="ma-0 pa-0 fill-height">
        <v-container
          class="fill-height"
          style="padding: 5px 0 0 5px; align-items: stretch; -webkit-app-region: no-drag;"
        >
          <v-row
            class="ma-0 pa-0"
            align="center"
            justify="center"
            style="-webkit-app-region: drag;"
          >
            <span
              style="font-size: 13.5px; margin-top: -5px"
              v-text="captionText"
            />
          </v-row>
        </v-container>
      </v-col>
      <v-col class="ma-0 pa-0" style="min-width: 120px; max-width: 120px;">
        <v-container class="pa-0 fill-height">
          <v-row class="ma-0 pa-0 fill-height">
            <v-col
              class="ma-0 pa-0"
              v-for="button in captionButtons"
              :key="button.role"
              style="text-align: center; -webkit-app-region: no-drag;"
            >
              <v-btn
                v-if="button.role !== 'settings'"
                style="width: 30px; height: 100%;"
                @click="onCaptionButtonClick(button.role)"
                icon plain tile
              >
                <v-icon class="ma-0" size="15" v-text="button.icon"/>
              </v-btn>
              <v-menu auto bottom offset-y tile v-else>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    style="width: 30px; height: 100%;"
                    v-on="on"
                    v-bind="attrs"
                    icon plain tile
                  >
                    <v-icon class="ma-0" size="15" v-text="button.icon"/>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item
                    v-for="item in captionMenuItems"
                    :key="item.role"
                    @click="onCaptionMenuItemClick(item.role)"
                    link
                  >
                    <v-list-item-content>
                      <v-list-item-title v-text="item.header" />
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { TabItem } from '../interface'

type CaptionButtonRole = 'settings' | 'minimize' | 'maximize' | 'close'
type CaptionMenuRole = 'settings' | 'toggleDevTools' | 'reloadPage' | 'about'

interface CaptionButton {
  icon: string
  role: CaptionButtonRole
}

interface CaptionMenuItem {
  header: string
  role: CaptionMenuRole
}

export default Vue.extend({
  name: 'TitleBar',

  data () {
    return {
      captionMenuItems: [
        {
          header: this.$texts.header.captionMenu.settings,
          role: 'settings'
        },
        {
          header: this.$texts.header.captionMenu.toggleDevTools,
          role: 'toggleDevTools'
        },
        {
          header: this.$texts.header.captionMenu.reloadPage,
          role: 'reloadPage'
        },
        {
          header: this.$texts.header.captionMenu.about,
          role: 'about'
        }
      ] as CaptionMenuItem[]
    }
  },

  methods: {
    onCaptionButtonClick (role: string) {
      window.ipcRenderer.send(role)
    },

    onCaptionMenuItemClick (role: CaptionMenuRole) {
      switch (role) {
        case 'settings':
        case 'about':
          this.$store.dispatch('pushTab', {
            header: this.$texts.header[role],
            page: role
          } as TabItem)
          break
        case 'toggleDevTools':
          window.ipcRenderer.send('toggleDevTools')
          break
        case 'reloadPage':
          location.reload()
          break
      }
    }
  },

  computed: {
    captionText () {
      const appTitle = this.$texts.title.app
      const tabTitle = this.$store.getters.currentTabText as string
      return tabTitle.length !== 0
        ? `${appTitle} - ${tabTitle}`
        : `${appTitle}`
    },

    captionButtons () {
      return [
        { icon: 'mdi-cog', role: 'settings' },
        { icon: 'mdi-window-minimize', role: 'minimize' },
        {
          icon: this.$store.getters.windowMaximized
            ? 'mdi-window-restore'
            : 'mdi-window-maximize',
          role: 'maximize'
        },
        { icon: 'mdi-window-close', role: 'close' }
      ] as CaptionButton[]
    }
  },

  created () {
    window.ipcRenderer.on(
      'windowMaximized',
      (_event, maximized: boolean) => {
        this.$store.dispatch('setWindowMaximized', maximized)
      }
    )
  }
})
</script>
