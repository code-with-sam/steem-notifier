const electron = require('electron')
const {app, Menu, Tray, BrowserWindow, Screen, ipcMain, Notification, nativeImage} = electron

const path = require('path')
const url = require('url')
const steem = require('steem');
const open = require("open");

let stream,
    dataStoreForSleep,
    votePower,
    votePowerPolling,
    sender

steem.api.setOptions({ url: 'https://api.steemit.com' });


ipcMain.on('enable-notifications', (event, data) => {
  sender = event.sender;
  dataStoreForSleep = data;

  getUserInfo(data.username)
    .then(data => event.sender.send('user-data', data))

  getVotePower(data.username).then(data => {
    votePower = data;
  })

    try { stopStream() }
    catch(err) { console.log('Stream is already disabled ')}
    try { stopVotePowerPolling() }
    catch(err) { console.log('Vote Power Polling is already disabled ')}
    startStream(data.username, data.notifications)
    startVotePowerPolling(data.username, data.notifications)
})

ipcMain.on('disable-notifications', (event, data) => {
  stopStream()
})

ipcMain.on('request-vote-power', (event, data) => {
  event.sender.send('vote-power', votePower)
})

ipcMain.on('open-notification', (event, data) => {
  open(data.link)
})

let tray;
let appView = null;

function appReady() {
    if (app.dock)
      app.dock.hide()

    let trayIcon = path.join(__dirname, 'steem-icon.png')
    tray = new Tray(trayIcon)
    tray.setToolTip('Steem Notifier')
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Clear Default User', click () { clearDefaultUser() }},
        {type: 'separator'},
        {label: 'Quit', click () { app.quit() }}
    ])

    tray.on('right-click', () => {
        tray.popUpContextMenu(contextMenu)
    })

    tray.on('click', () => {
      if (appView === null){
        createWindow();
      } else {
        openWindow(appView);
      }
    })

  electron.powerMonitor.on('suspend', () => {
    console.log('The system is going to sleep')
    stopStream()
    stopVotePowerPolling()
  })
  electron.powerMonitor.on('resume', () => {
    console.log('The system is starting again')

    setTimeout( ()=> {
      console.log(dataStoreForSleep.username, dataStoreForSleep.notifications)
      startStream(dataStoreForSleep.username, dataStoreForSleep.notifications)
      startVotePowerPolling(dataStoreForSleep.username, dataStoreForSleep.notifications)
    }, 10000)
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
    titleBarStyle: 'hidden',
    width: 500,
    height: 300,
    frame: true,
    show: false,
    resizable: false,
    x: trayPosition.x - 125,
    y: yPos,
    icon: path.join(__dirname, 'steem-icon.png')
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

function clearDefaultUser(){
  if( sender !== undefined)
    sender.send('clear-default-user')
}
function stopStream(){
  if (typeof stream !== undefined) {
    stream()
    console.log('stream stopped')
  }
}

  function startStream(USERNAME, enable){
    
  steem.api.setOptions({ url: 'https://api.steemit.com' });
  stream = steem.api.streamBlockNumber((err, blockNum) => {
      steem.api.getOpsInBlock(blockNum, false, (err, operations) =>{
          operations.forEach( (tx, i, arr) => {

            let json, jsonType, jsonContent;
            let transaction = tx.op[0]

            if(transaction == 'comment') {
              let commentBody = tx.op[1].body;
              let mentionUsername = '@'+USERNAME;
              let includesMention = commentBody.includes(mentionUsername);
              transaction = includesMention ? 'mention' : 'comment'
            }

            if(transaction == 'custom_json') {

              json = JSON.parse(tx.op[1].json)
              jsonType =  json[0]
              jsonContent = json[1]

              if ( jsonType == 'follow' ){
                transaction = 'follow'
              }
              if ( jsonType == 'reblog' ){
                transaction = 'reblog'
              }
            }

            switch(true){
              case (enable.comments == true && transaction == 'comment' && tx.op[1].parent_author == USERNAME):
                  sendNotification({
                    nType: 'comment',
                    icon: path.join(__dirname, '/img/comment-icon.png'),
                    author: tx.op[1].author,
                    body : tx.op[1].body,
                    link : `https://steemit.com/@${tx.op[1].author }/${tx.op[1].permlink}/`
                  })
              break;
              case (enable.transfers == true && transaction == 'transfer' && tx.op[1].to == USERNAME ):
                  sendNotification({
                    nType: 'transfer',
                    icon: path.join(__dirname, '/img/transfer-icon.png'),
                    from: tx.op[1].from,
                    amount : tx.op[1].amount,
                    link : `https://steemit.com/@${USERNAME}/transfers`
                  })
              break;
              case (enable.votes == true && transaction == 'vote' && tx.op[1].author == USERNAME):
                  sendNotification({
                    nType: 'vote',
                    icon: path.join(__dirname, '/img/vote-icon.png'),
                    from: tx.op[1].voter,
                    weight :  tx.op[1].weight ? tx.op[1].weight : 10000,
                    link : `https://steemit.com/@${tx.op[1].author }/${tx.op[1].permlink}/`
                  })
              break;
              case (enable.authorRewards == true && transaction == 'author_reward' && tx.op[1].author == USERNAME ):
                  sendNotification({
                    nType: 'Author Reward',
                    icon: path.join(__dirname, '/img/reward-icon.png'),
                    sbd:  tx.op[1].sbd_payout,
                    vests: tx.op[1].vesting_payout,
                    steem: tx.op[1].steem_payout,
                    link : `https://steemit.com/@${tx.op[1].author }/transfers`
                  })
              break;
              case (enable.commentRewards == true && transaction == 'comment_reward' && tx.op[1].author == USERNAME ):
                  sendNotification({
                    nType: 'Comment Reward',
                    icon: path.join(__dirname, '/img/reward-icon.png'),
                    sbd:  tx.op[1].sbd_payout,
                    vests: tx.op[1].vesting_payout,
                    steem: tx.op[1].steem_payout,
                    link : `https://steemit.com/@${tx.op[1].author }/transfers`
                  })
              break;
              case (enable.curationRewards == true && transaction == 'curation_reward' && tx.op[1].author == USERNAME ):
                  sendNotification({
                    nType: 'Curation Reward',
                    icon: path.join(__dirname, '/img/reward-icon.png'),
                    sbd:  tx.op[1].sbd_payout,
                    vests: tx.op[1].vesting_payout,
                    steem: tx.op[1].steem_payout,
                    link : `https://steemit.com/@${tx.op[1].author }/transfers`
                  })
              break;
              case (enable.mentions == true && transaction == 'mention'):
                  sendNotification({
                    nType: 'mention',
                    icon: path.join(__dirname, '/img/mention-icon.png'),
                    from: tx.op[1].author,
                    link : `https://steemit.com/@${tx.op[1].author }/${tx.op[1].permlink}/`
                  })
              break;
              case (enable.follows == true && transaction == 'follow' && jsonContent.following == USERNAME ):
                  sendNotification({
                    nType: 'follow',
                    icon: path.join(__dirname, '/img/follow-icon.png'),
                    from: jsonContent.follower,
                    link : `https://steemit.com/@${jsonContent.follower}`
                  })
              break;
              case (enable.reblogs == true && transaction == 'reblog' && jsonContent.author == USERNAME ):
                  sendNotification({
                    nType: 'reblog',
                    icon: path.join(__dirname, '/img/reblog-icon.png'),
                    from: jsonContent.account,
                    link : `https://steemit.com/@${jsonContent.account}`
                  })
              break;
              default:
              }
          })
      })
  });
  console.log('stream Started')
}

function sendNotification(data) {
  let message;
  switch(data.nType){
    case 'comment':
      message = `@${data.author} : ${data.body.substring(0,20)}...`
    break;
    case 'transfer':
      message = `@${data.from} : Sent you ${data.amount}`
    break;
    case 'vote':
      message = `@${data.from} : voted ${data.weight/100}%`
    break;
    case 'mention':
      message = `@${data.from}: mentioned you...`
    break;
    case 'Author Reward':
      message = `Author Reward: ${data.sbd}`
    break;
    case 'Comment Reward':
      message = `Comment Reward: ${data.sbd}`
    break;
    case 'Curation Reward':
      message = `Curation Reward: ${data.sbd}`
    break;
    case 'follow':
      message = `@${data.from}: just followed you `
    break;
    case 'reblog':
      message = `${data.from}: Re-Steemed your content`
    break;
    case 'Vote Power':
      message = `VotePower at ${data.from}`
    break;
    default:
    message = `New notification`
  }

  sender.send('show-notification', {
    title: `New Steem ${data.nType}!`,
    body:  message,
    silent: true,
    icon: data.icon || path.join(__dirname, 'steem-icon@2x.png'),
    link: data.link
  })
}


function getUserInfo(username){
  return new Promise( (resolve, reject) => {
      steem.api.getAccounts([username], (err, result) => {
          let user  = result[0]

          let jsonData = user.json_metadata ? JSON.parse(user.json_metadata).profile : {}

          let info = {
            name: user.name,
            bio: jsonData.about,
            image: jsonData.profile_image ? 'https://steemitimages.com/2048x512/' + jsonData.profile_image : '',
            numOfPosts: user.post_count,
            followerCount: '',
            followingCount: '',
            usdValue: '',
          }

          steem.api.getFollowCount(user.name, (err, result) => {
                info.followerCount = result.follower_count
                info.followingCount = result.following_count
              })

          let usd  = steem.formatter.estimateAccountValue(user)

          usd.then(data => {
            info.usdValue = data
            resolve(info)
          })
      })
  });
}

function getVotePower(username){
  return new Promise( (resolve, reject) => {
      steem.api.getAccounts([username], (err, result) => {
          let user  = result[0]

          let lastVoteTime = (new Date - new Date(user.last_vote_time + "Z")) / 1000;
          let votePower = user.voting_power += (10000 * lastVoteTime / 432000);
          votePower = Math.min(votePower / 100, 100)
          resolve(votePower)
      })
  })
}

function startVotePowerPolling(username, enable){
  let pollTimer = 30 * 1000;
  votePowerPolling = setInterval(() => {

    getVotePower(username)
      .then(data => {
          if (votePower != undefined){
            if ( data >= 90 && votePower < 90 && enable.votePower90 == true){
              sendNotification({
                nType: 'Vote Power',
                from: '90%',
                link : `https://steemit.com/@${username}`
              })
            } else if ( data >= 100 && votePower < 100 && enable.votePower100 == true){
              sendNotification({
                nType: 'Vote Power',
                from: '100%',
                link : `https://steemit.com/@${username}`
              })
            }
          }
          votePower = data;
      })

  }, pollTimer)
  console.log('Vote Power Polling Started')
}

function stopVotePowerPolling(){
  clearInterval(votePowerPolling);
  console.log('Vote Power Polling Stopped')
}
