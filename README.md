# steem-notifier v 1.0.1

> Steem Notifier is a minimal taskbar application that send notifications about your [Steem account](http://steemit.com) through your native operating systems notification interface.

![screen](https://user-images.githubusercontent.com/34964560/35290479-48262cd2-0062-11e8-8dc0-588c67a0f32d.png)

# V1.0.1 Release
You can now download [packaged app releases](https://github.com/code-with-sam/steem-notifier/releases)


## How To
Steem Motifer is an electron based app an can run cross platform with windows/osx/linux. ```Version 1.0.0``` is only tested with OSX.

```
git clone git@github.com:code-with-sam/steem-notifier.git
```

## Build locally
```
npm install
npm run package-mac
npm run package-win
npm run package-linux
```
find release builds in ```release/``` 

## setup/install for Development 
```
npm install
npm start
```

Steem-notifier will launch automatically to your taskbar. You can click on the taskbar to launch the app. You'll be presented with a input field to enter your username. Select the type of notifications you would like to receive, each time you check/uncheck a selection notifiter updates your prefrences in the background. You will begin receiving native desktop notifications. You can click the notification to be sent to the action in your browser, click close to dismiss it or leave the notification to timeout. to stop receiving notifications exit the app, or click the disable-notifications button.



## RoadMap/Ideas
- multiple account support
- ability to reply and upvote directly to messages in app
- history/feed of recent actions
- poll user data for new information
- add estimated earnings
- use username autocomplete API
- add help screen

# Contributions are welcome
Let me know if you have any ideas or feel free to submit PR's
