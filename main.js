const {app, Menu, Tray, BrowserWindow, Screen } = require('electron')

const path = require('path')
const url = require('url')

const steem = require('steem');
const notifier = require('node-notifier');

const {ipcMain} = require('electron')

let username;

ipcMain.on('new-username', (event, data) => {
  username = data
})


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
    // resizable: false,
    x: trayPosition.x - 150,
    y: trayPosition.y + 35
  })

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

// main process code. You can also put them in separate files and require them here.
var streamComments = steem.api.streamTransactions('head', function(err, result) {

 if(result.operations["0"]["0"]=='comment'&&result.operations[0][1].parent_author == username){
   let comment = {
     author: result.operations[0][1].parent_author,
     body : result.operations[0][1].body,
     link : `https://steemit.com/@${result.operations[0][1].parent_author }/${result.operations[0][1].permlink}/`
   }
   console.log(comment)
 }


});
