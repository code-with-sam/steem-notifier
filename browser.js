const {ipcRenderer} = require('electron')
const $ = require('jquery');

let notifications = {
  comments : true,
  votes : false,
  transfers : true,
  authorRewards : true,
  commentRewards : true,
  curationRewards: true,
  mentions : true,
  follows : true,
  reblogs : true,
  votePower90 : true,
  votePower100 : true
}

// UI ACTIONS

$(document).ready(()=> {
  $('.intro-pane__inner').removeClass('animation-start')
  $('.intro-pane__username').focus()
})

$('.check-box').on('click', (e) => {

  let currentCheckBox = $(e.currentTarget)
  let checkData = currentCheckBox.parent().data('notification')
  let isChecked = currentCheckBox.hasClass('checked');
  if( isChecked ) {
    currentCheckBox.removeClass('checked')
    notifications[checkData] = false;
  } else {
    currentCheckBox.addClass('checked')
    notifications[checkData] = true;
  }
  updateNotifications(notifications)
})


$('.intro-pane__username').keypress(function(e) {
    let val = $('.intro-pane__username').val()
    if(e.which == 13 && val != '' ) {
      $('.intro-pane').fadeOut(750)
      $('.animation-hidden').removeClass('animation-hidden')
      updateNotifications(notifications)
    }
});

// EVENTS
ipcRenderer.send('request-vote-power')

setInterval(()=> {
  ipcRenderer.send('request-vote-power')
}, 30000)
// UI ACTIONS


ipcRenderer.on('user-data', (event, data) => {
  console.log(data)
  $('.notifactions__user-name').text(data.name)
  $('.notifactions__user-bio').text(data.bio)
  $('.notifactions__user-stats').text(`Following: ${data.followingCount} | Followers: ${data.followerCount} | Posts: ${data.numOfPosts}`)
  $('.notifactions__user-value').text(`Account Value: $${data.usdValue}`)
  $('.notifactions__user-image').attr('src', data.image)
})


ipcRenderer.on('vote-power', (event, data) => {
  console.log(data);

  if (data){

      $('.vote-power').text(data.toFixed(2) + '%')

      document.querySelector('.vote-ring').style.strokeDashoffset = 200 - data*2
      document.querySelector('.vote-ring').style.opacity = 1
  }



})
// FUNCTIIONS

function updateNotifications(notifications){
  let username = $('.intro-pane__username').val();
  let data = {
    notifications: notifications,
    username : username
  }
  console.log('update notifications')
  ipcRenderer.send('enable-notifications', data)
}

function disableNotifications(){
  ipcRenderer.send('disable-notifications')
}
