'use strict'

import fs from 'fs'
import path from 'path'
import excel, { BookType } from 'xlsx'
import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { ConnectionOptions, QueryError } from 'mysql2'
import Server from './server/server'

const isDevelopment = process.env.NODE_ENV !== 'production'
const configPath = path.join(isDevelopment ? __dirname : process.cwd(), 'config.json')
const backupPath = path.join(isDevelopment ? __dirname : process.cwd(), 'backup.json')
const aboutPath = path.join(isDevelopment ? __dirname : process.cwd(), 'about.html')
const outputDir = path.join(isDevelopment ? __dirname : process.cwd(), 'output')

let config: Record<string, unknown> | null = null
let server: Server | null = null

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: (
        process.env.ELECTRON_NODE_INTEGRATION as unknown
      ) as boolean,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }

  initIpcConnections(win)
  initWindowEvents(win)
  initConfig(win)
  initBackup(win)
  initServer(win)
}

function initIpcConnections (win: BrowserWindow) {
  ipcMain.on('minimize', () => {
    win.minimize()
  })

  ipcMain.on('maximize', () => {
    if (win.isMaximized()) {
      win.restore()
    } else {
      win.maximize()
    }
  })

  ipcMain.on('close', () => {
    win.close()
  })

  ipcMain.on('loadConfig', (event) => {
    if (config) {
      event.sender.send('configLoaded', JSON.stringify(config))
    } else {
      event.sender.send('error', '??????????????????????????????')
    }
  })

  ipcMain.on('saveConfig', (event, configStr: string) => {
    try {
      const edited = JSON.parse(configStr)
      Object.assign(config, edited)
      fs.writeFileSync(configPath, JSON.stringify(edited, null, 2))
      event.sender.send('info', `?????????????????????: ${configPath}, ?????????????????????????????????`)
    } catch (error) {
      event.sender.send('error', error)
    }
  })

  ipcMain.on('loadBackup', () => {
    initBackup(win)
  })

  ipcMain.on('saveBackup', (event, backupStr: string) => {
    try {
      const backup = JSON.parse(backupStr)
      fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))
    } catch (error) {
      event.sender.send('error', error)
    }
  })

  ipcMain.on('connect', (event) => {
    if (!server) {
      initServer(win)
    } else {
      if (!server.isConnected()) {
        tryConnectDatabase(server, win)
      } else {
        event.sender.send('databaseConnected')
      }
    }
  })

  ipcMain.on('query', (event, { type, sql }) => {
    if (!server) { return }
    server.query(sql as string, (error, results, field) => {
      if (error) {
        event.sender.send('error', error.message)
      } else {
        if (results) {
          const result = { type, results, field }
          event.sender.send('queryResult', result)
        }
      }
    })
  })

  ipcMain.on('querySync', (event, { type, sql }) => {
    if (!server) { return }
    server.queryAndWait(sql).then((value) => {
      const { error, results, field } = value as {
        error: QueryError | null,
        results: unknown,
        field: unknown
      }
      if (error) {
        event.sender.send('error', error.message)
      } else {
        if (results) {
          const result = { type, results, field }
          event.returnValue = result
        }
      }
    })
  })

  ipcMain.on('toggleDevTools', () => {
    win.webContents.toggleDevTools()
  })

  ipcMain.on('exportData', (event, { fileName, extName, data }: {
    fileName: string,
    extName: string,
    data: string
  }) => {
    const file = [fileName, extName].join('.')
    const filePath = path.join(outputDir, file)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }

    try {
      const jsonData = JSON.parse(data)
      const sheet = excel.utils.json_to_sheet(jsonData)
      const workbook = {
        SheetNames: ['dangqing-web-export'],
        Sheets: { 'dangqing-web-export': sheet }
      } as excel.WorkBook
      excel.writeFile(workbook, filePath, { bookType: extName as BookType })
      event.sender.send('info', `???????????????: ${filePath}`)
    } catch (error) {
      event.sender.send('error', error)
    }
  })

  ipcMain.on('loadAbout', (event) => {
    event.sender.send('aboutLoaded', aboutPath)
  })
}

function initWindowEvents (win: BrowserWindow) {
  win.on('maximize', () => {
    win.webContents.send('windowMaximized', true)
  })
  win.on('unmaximize', () => {
    win.webContents.send('windowMaximized', false)
  })
}

function initConfig (win: BrowserWindow) {
  try {
    const configStr = loadConfig()
    config = JSON.parse(configStr)
    win.webContents.send('configLoaded', configStr)
  } catch (error) {
    config = {
      database: {
        host: 'rm-uf64u9qj410or7qhgto.mysql.rds.aliyuncs.com',
        user: 'user',
        password: 'Qwer123!',
        database: 'database_test',
        connectTimeout: 5000
      }
    }
    win.webContents.send('configLoaded', JSON.stringify(config))
  }
}

function initBackup (win: BrowserWindow) {
  try {
    const backupStr = loadBackup()
    win.webContents.send('backupLoaded', backupStr)
  } catch (error) {
    //
  }
}

function initServer (win: BrowserWindow) {
  if (config) {
    server = new Server(config['database'] as ConnectionOptions)
    tryConnectDatabase(server, win)
  }
}

function loadConfig () {
  return fs.readFileSync(configPath).toString()
}

function loadBackup () {
  return fs.readFileSync(backupPath).toString()
}

function tryConnectDatabase (server: Server, win: BrowserWindow) {
  server.connect((error) => {
    if (error) {
      win.webContents.send('error', error.message)
      server.disconnect(error => {
        if (error) {
          win.webContents.send('error', error.message)
        }
      })
      setTimeout(() => {
        tryConnectDatabase(server, win)
      }, 5000)
    } else {
      win.webContents.send('databaseConnected')
    }
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
