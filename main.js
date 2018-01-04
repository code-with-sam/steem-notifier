const {app, Menu, Tray, BrowserWindow, Screen} = require('electron')

const path = require('path')
const url = require('url')

const steem = require('steem');
const notifier = require('node-notifier');
const Positioner = require('electron-positioner');

let tray;
let appView;

function appReady() {

    tray = new Tray('./steem-icon.png')
      // const contextMenu = Menu.buildFromTemplate([
      //   {label: 'Item1', type: 'radio'},
      //   {label: 'Item2', type: 'radio'},
      //   {label: 'Item3', type: 'radio', checked: true},
      //   {label: 'Item4', type: 'radio'}
      // ])
      tray.setToolTip('This is my application.')
      // tray.setContextMenu(contextMenu)
      tray.getBounds()

      tray.on('click', openWindow)
      tray.on('double-click', openWindow)
      // add quit button in menu

      let trayPosition = tray.getBounds()
      console.log(trayPosition)
      console.log(trayPosition.x)
      console.log(trayPosition.y)

      appView = new BrowserWindow({
        width: 300,
        height: 150,
        frame: false,
        show: false,
        x: trayPosition.x - 150,
        y: trayPosition.y + 35
      })

      // right click quit app
      // close window if click off
      // close window btn
      // add screen for username
      // store username
      // listen for username
      // show notifications for comments
      // create link or close for notifcation


}
function openWindow(data) {
  let trayPosition = tray.getBounds()

  appView = new BrowserWindow({
    width: 300,
    height: 150,
    frame: true,
    show: false,
    x: trayPosition.x - 150,
    y: trayPosition.y + 35
  })

  console.log('clicked', data)
  appView.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  appView.show()
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
