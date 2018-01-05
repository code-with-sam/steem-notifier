const {app, Menu, Tray, BrowserWindow, Screen, ipcMain } = require('electron')

const path = require('path')
const url = require('url')

const steem = require('steem');
// custom node notifier
const notification = require('./lib/node-notifier/index.js');
const open = require("open");

let username;

ipcMain.on('new-username', (event, data) => {
  console.log('username set', data)
  username = data
})


let tray;
let appView = null;

function appReady() {
    tray = new Tray('./steem-icon.png')
    tray.setToolTip('steem-notifier-v-0-1')
    tray.on('click', () => {
      if (appView === null){
        createWindow();
      } else {
        openWindow(appView);
      }
    })
}

function createWindow() {
  let trayPosition = tray.getBounds()

  appView = new BrowserWindow({
    width: 300,
    height: 150,
    frame: true,
    show: false,
    resizable: false,
    x: trayPosition.x - 150,
    y: trayPosition.y + 35
  })

  appView.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  openWindow(appView)
}

function openWindow(appWindow) {
  appWindow.show()
}

app.on('ready', appReady)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  appView = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// main process code. You can also put them in separate files and require them here.
var streamComments = steem.api.streamTransactions('head', function(err, result) {
  let transaction = result.operations[0][0]

  if(transaction == 'comment') {
    let commentBody = result.operations[0][1].body;
    let mentionUsername = '@'+username;
    let includesMention = commentBody.includes(mentionUsername);

    transaction = includesMention ? 'mention' : 'comment'
  }

  // transation types -
  // comment+comment_reply
  // /transfer/
  // vote/
  // payout ------
  // author_reward,
  // curation_reward,
  // comment_reward,
  // liquidity_reward,
  // ---------
  // mention
  //  .body:STRING contains -> @username
  
  // when you reach 100% voting power

  let notificationType = '';

switch(true){
  case (transaction == 'comment'):
      sendNotification({
        nType: 'comment',
        author: result.operations[0][1].parent_author,
        body : result.operations[0][1].body,
        link : `https://steemit.com/@${result.operations[0][1].parent_author }/${result.operations[0][1].permlink}/`
      })

  break;
  case (transaction == 'transfer'):
      sendNotification({
        nType: 'transfer',
        from: result.operations[0][1].from,
        amount : result.operations[0][1].amount,
        link : `https://steemit.com/@${username}/transfers`
      })
  break;
  case (transaction == 'vote'):
      sendNotification({
        nType: 'vote',
        from: result.operations[0][1].voter,
        weight : result.operations[0][1].weight,
        link : `https://steemit.com/@${result.operations[0][1].author }/${result.operations[0][1].permlink}/`
      })
  break;
  // case (transaction == 'author_reward' || transaction == 'comment_reward' ):
  //     sendNotification({
  //       nType: 'vote',
  //       from: result.operations[0][1].voter,
  //       weight : result.operations[0][1].weight,
  //       link : `https://steemit.com/@${result.operations[0][1].author }/${result.operations[0][1].permlink}/`
  //     })
  // break;
  case (transaction == 'mention'):
      sendNotification({
        nType: 'mention',
        from: result.operations[0][1].parent_author,
        link : `https://steemit.com/@${result.operations[0][1].author }/${result.operations[0][1].permlink}/`
      })
  break;
  default:
    console.log('default');
}
});

function sendNotification(data) {

  let message;
  switch(data.nType){
    case 'comment':
      message = `${data.author} : ${data.body.substring(0,20)}...`
    break;
    case 'transfer':
      message = `${data.from} : Sent you ${data.amount}`
    break;
    case 'vote':
      message = `${data.from} : voted ${data.weight/100}%`
    break;
    case 'mention':
      message = `${data.from} mentioned you...`
    break;
  }

  notification.notify({
      title: `New Steem ${data.nType}!`,
      message: message,
      closeLabel: 'Close',
      timeout: 20,
      icon: './steem-icon-large.png',
      actions: 'View',
      open: data.link
   });

   notification.on('click', function (notifierObject, options) {
     open(data.link)
   });
}
