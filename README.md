# steem-notifier v 0.1

Steem-notifer is a minimal desktop/menubar/hidden-app, its configurable to show incoming notifications for you steem account

![Screen](https://i.imgsafe.org/e3/e38415228a.png)

## How To
Steem-notifer is an electron based app an can run cross platform with windows/osx/linux. ```Version 0.1``` is only tested with OSX.

```
git clone git@github.com:code-with-sam/steem-notifier.git
```

setup/install
```
npm install
npm start
```

Steem-notifier will launch automatically to your taskbar. You can click on the taskbar icon to add your username, when you click ```activate``` you will begin receiving desktop notifications. you can click the notification to be sent to the comment in your browser, click closer or leave the notification to timeout as usual.  


## future development
- cross-platform compatibility
- multiple account support (think hootsuite)
- ability to reply directly and upvote in app (would need to support wif key)
- history/feed of recent comments
- add notifications receiving transfers e.b SBD/STEEM
