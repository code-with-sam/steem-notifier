const {app, Menu, Tray, BrowserWindow} = require('electron')

const path = require('path')
const url = require('url')

const steem = require('steem');
const notifier = require('node-notifier');

let tray = null

function appReady() {
    tray = new Tray('./steem-icon.png')
      const contextMenu = Menu.buildFromTemplate([
        {label: 'Item1', type: 'radio'},
        {label: 'Item2', type: 'radio'},
        {label: 'Item3', type: 'radio', checked: true},
        {label: 'Item4', type: 'radio'}
      ])
      tray.setToolTip('This is my application.')
      tray.setContextMenu(contextMenu)
}

app.on('ready', appReady)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
