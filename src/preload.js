import { contextBridge, ipcRenderer } from 'electron'
window.ipcRenderer = ipcRenderer

// const validSendChannels = [
//   'minimize', 'maximize', 'close', 'loadConfig', 'saveConfig', 'connect', 'query'
// ]

// const validReceiveChannels = [
//   'windowMaximized', 'configLoaded', 'databaseConnected', 'queryResult', 'info', 'error'
// ]

// contextBridge.exposeInMainWorld('ipcRenderer', {
//   send: (channel, data) => {
//     if (validSendChannels.includes(channel)) {
//       ipcRenderer.send(channel, data)
//     }
//   },

//   on: (channel, func) => {
//     if (validReceiveChannels.includes(channel)) {
//       ipcRenderer.on(channel, func)
//     }
//   },

//   once: (channel, func) => {
//     if (validReceiveChannels.includes(channel)) {
//       ipcRenderer.once(channel, func)
//     }
//   },

//   removeListener: (channel, func) => {
//     if (validReceiveChannels.includes(channel)) {
//       ipcRenderer.removeListener(channel, func)
//     }
//   },

//   removeAllListeners: (channel) => {
//     if (validReceiveChannels.includes(channel)) {
//       ipcRenderer.removeAllListeners(channel)
//     }
//   }
// })
