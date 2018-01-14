const {app, Menu, Tray, BrowserWindow, Screen, ipcMain } = require('electron')

const path = require('path')
const url = require('url')

const steem = require('steem');
// custom node notifier
const notification = require('./lib/node-notifier/index.js');
const open = require("open");

let stream;
let usernameStore;

steem.api.setOptions({ url: 'wss://rpc.buildteam.io' });


ipcMain.on('enable-notifications', (event, data) => {
  usernameStore = data.username;
  console.log('notifications', data)
  startStream(data.username, data.notifications)
})

ipcMain.on('disable-notifications', (event, data) => {
  stopStream()
})


let tray;
let appView = null;

function appReady() {
    if (app.dock)
      app.dock.hide()

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
  let yPos;
  if (process.platform !== 'darwin') {
    yPos = trayPosition.y - 395
  } else {
    yPos = trayPosition.y +35
  }

  appView = new BrowserWindow({
    width: 500,
    height: 300,
    frame: true,
    show: false,
    // resizable: false,
    x: trayPosition.x - 125,
    y: yPos
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

function stopStream(){
  if (typeof stream !== undefined) stream()
}

function startStream(USERNAME, enable){

  stream = steem.api.streamBlockNumber((err, blockNum) => {
      steem.api.getOpsInBlock(blockNum, false, (err, operations) =>{
          operations.forEach( (tx, i, arr) => {

            let transaction = tx.op[0]

            if(transaction == 'comment') {
              let commentBody = tx.op[1].body;
              let mentionUsername = '@'+USERNAME;
              let includesMention = commentBody.includes(mentionUsername);
              transaction = includesMention ? 'mention' : 'comment'
            }

            switch(true){
              case (enable.comments == true && transaction == 'comment' && tx.op[1].parent_author == USERNAME):
                  sendNotification({
                    nType: 'comment',
                    author: tx.op[1].parent_author,
                    body : tx.op[1].body,
                    link : `https://steemit.com/@${tx.op[1].parent_author }/${tx.op[1].permlink}/`
                  })
              break;
              case (enable.transfers == true && transaction == 'transfer' && tx.op[1].to == USERNAME ):
                  sendNotification({
                    nType: 'transfer',
                    from: tx.op[1].from,
                    amount : tx.op[1].amount,
                    link : `https://steemit.com/@${USERNAME}/transfers`
                  })
              break;
              case (enable.votes == true && transaction == 'vote' && tx.op[1].author == USERNAME):
                  sendNotification({
                    nType: 'vote',
                    from: tx.op[1].voter,
                    weight :  tx.op[1].weight ? tx.op[1].weight : 10000,
                    link : `https://steemit.com/@${tx.op[1].author }/${tx.op[1].permlink}/`
                  })
              break;
              case (enable.authorRewards == true && transaction == 'author_reward' && tx.op[1].author == USERNAME ):
                  sendNotification({
                    nType: 'Author Reward',
                    sbd:  tx.op[1].sbd_payout,
                    vests: tx.op[1].vesting_payout,
                    steem: tx.op[1].steem_payout,
                    link : `https://steemit.com/@${tx.op[1].author }/${tx.op[1].permlink}/`
                  })
              break;
              case (enable.CommentRewards == true && transaction == 'comment_reward' && tx.op[1].author == USERNAME ):
                  sendNotification({
                    nType: 'Comment Reward',
                    sbd:  tx.op[1].sbd_payout,
                    vests: tx.op[1].vesting_payout,
                    steem: tx.op[1].steem_payout,
                    link : `https://steemit.com/@${tx.op[1].author }/${tx.op[1].permlink}/`
                  })
              break;
              case (enable.mentions == true && transaction == 'mention'):
                  sendNotification({
                    nType: 'mention',
                    from: tx.op[1].parent_author,
                    link : `https://steemit.com/@${tx.op[1].author }/${tx.op[1].permlink}/`
                  })
              break;
              default:
              }
          })
      })
  });
}

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
    case 'Author Reward':
      message = `Author Reward: ${data.sbd}`
    break;
    case 'Comment Reward':
      message = `Comment Reward: ${data.sbd}`
    break;
    default:
    message = `New notification`

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
