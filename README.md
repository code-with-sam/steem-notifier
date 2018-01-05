# steem-notifier v 0.2.0

> Steem Notifier is a minimal taskbar application that send notifications about your [Steem account](http://steemit.com) through your native operating systems notification interface.

![Screen](https://i.imgsafe.org/ff/ffb9bd0948.jpeg)

## How To
Steem Motifer is an electron based app an can run cross platform with windows/osx/linux. ```Version 0.2.0``` is only tested with OSX.

```
git clone git@github.com:code-with-sam/steem-notifier.git
```

setup/install
```
npm install
npm start
```

Steem-notifier will launch automatically to your taskbar. You can click on the taskbar icon to add your username. Select the type of notifications you would like to receive and click enable. You will begin receiving desktop notifications. You can click the notification to be sent to the action in your browser, click close to dismiss it or leave the notification to timeout. to stop receiving notifications exit the app, or click the disable-notifications button.

## Why is there a /lib/node-notifer?
The local version of ```node-notifer``` is needed only for the custom notification icon on mac. By default mac uses the icon of the application that is originally sending the notification, in this case it is the module terminal-notifier running through node.js. Creating a clone of ```node-notifier``` which has a clone of  ```terminal-notifier.app``` with switched out app icons using this script [https://github.com/code-with-sam/customise-terminal-notifier](https://github.com/code-with-sam/customise-terminal-notifier).


## future development
- multiple account support (think hootsuite)
- ability to reply directly and upvote in app (would need to support wif key)
- history/feed of recent comments
