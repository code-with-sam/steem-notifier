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

$('.active-btn').on('click', () => {
  if ($('.username-input').val() === '') return false
  enableNotifications(notifications)
})
$('.de-active-btn').on('click', () => {
  disableNotifications()
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

function enableNotifications(notifications){
  let username = $('.username-input').val();
  let data = {
    notifications: notifications,
    username : username
  }
  ipcRenderer.send('enable-notifications', data)
  showOverlay('Enabled ✅');
  switchButtons();
}
function disableNotifications(){
  ipcRenderer.send('disable-notifications')
  switchButtons()
  showOverlay('Disabled ❌')
}

function showOverlay(message, action){
  $('.overlay p').text(message)
  $('.overlay').addClass('active')
  setTimeout(()=>{
    $('.overlay').removeClass('active')
  }, 2000)
}
function switchButtons(){
  if( $('.active-btn').is(":visible") ) {
    $('.active-btn').hide()
    $('.de-active-btn').show()
  } else {
    $('.de-active-btn').hide()
    $('.active-btn').show()
  }
}
