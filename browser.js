const {ipcRenderer} = require('electron')

document.querySelector('.active-btn').addEventListener('click', () => {
  let username = document.querySelector('.username-input').value
  ipcRenderer.send('new-username', username)
})
