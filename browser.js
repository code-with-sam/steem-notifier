const {ipcRenderer} = require('electron')
const $ = require('jquery');

let notifications = {
  comments : true,
  votes : false,
  transfers : true,
  authorRewards : true,
  commentRewards : true,
  mentions : true
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
})


$('.intro-pane__username').keypress(function(e) {
    let val = $('.intro-pane__username').val()
    if(e.which == 13 && val != '' ) {
      $('.intro-pane').fadeOut(750)
      $('.animation-hidden').removeClass('animation-hidden')
      enableNotifications(notifications)
    }
});


ipcRenderer.on('user-data', (event, data) => {
  console.log(data)
  $('.notifactions__user-name').text(data.name)
  $('.notifactions__user-bio').text(data.bio)
  $('.notifactions__user-stats').text(`Following: ${data.followingCount} | Followers: ${data.followerCount} | Posts: ${data.numOfPosts}`)
  $('.notifactions__user-value').text(`Account Value: $${data.usdValue}`)
  $('.notifactions__user-image').attr('src', data.image)
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
