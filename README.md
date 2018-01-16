# steem-notifier v 0.3.1

> Steem Notifier is a minimal taskbar application that send notifications about your [Steem account](http://steemit.com) through your native operating systems notification interface.

![Screen](https://i.imgsafe.org/d2/d24295d019.png)

## How To
Steem Motifer is an electron based app an can run cross platform with windows/osx/linux. ```Version 0.3.0``` is only tested with OSX.

```
git clone git@github.com:code-with-sam/steem-notifier.git
```

setup/install
```
npm install
npm start
```

Steem-notifier will launch automatically to your taskbar. You can click on the taskbar to launch the app. You'll be presented with a input field to enter your username. Select the type of notifications you would like to receive, each time you check/uncheck a selection notifiter updates your prefrences in the background. You will begin receiving native desktop notifications. You can click the notification to be sent to the action in your browser, click close to dismiss it or leave the notification to timeout. to stop receiving notifications exit the app, or click the disable-notifications button.

Check branches & PR's for the latest version

## Why is there a /lib/node-notifer?
The local version of ```node-notifer``` is needed only for the custom notification icon on mac. By default mac uses the icon of the application that is originally sending the notification, in this case it is the module terminal-notifier running through node.js. Creating a clone of ```node-notifier``` which has a clone of  ```terminal-notifier.app``` with switched out app icons using this script [https://github.com/code-with-sam/customise-terminal-notifier](https://github.com/code-with-sam/customise-terminal-notifier).


## RoadMap/Ideas
- save default user (so you don’t have to type it in)
- packaged release on app stores 
- multiple account support 
- ability to reply and upvote directly to messages in app
- history/feed of recent actions
- replace custom node notifier with other solution 
- poll user data for new information
- add estimated earnings
- use username autocomplete API
- add help screen

# Contributions are welcome
Let me know if you have any ideas or feel free to submit PR's
