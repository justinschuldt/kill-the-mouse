const { globalShortcut, Notification } = require('electron');
const ioHook = require('iohook');

const menubar = require('menubar');
const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

// frontend stuff
const url = require('url')
const path = require('path');
const _ = require('lodash');
const Vue = require('vue');

momentDurationFormatSetup(moment);

const mb = menubar();

const streak = {
  active: false,
  keys: 0
};
let isMenuBarOpen = false;

function handleKeyboardEvent(event) {
  if (!streak.active) {
    streak.active = true;
    streak.startTime = Date.now();
  }

  streak.keys++;
}

function handleMouseEvent(event) {
  if (!streak.active) { return };

  const currentTime = Date.now();
  const duration = moment.duration(currentTime - streak.startTime).format('h [hours], m [minutes], s [seconds]');

  console.log('streak.keys: ', streak.keys)
  if (streak.keys > 10) {
    const notification = new Notification({
      title: 'Streak broken!',
      body: `You typed ${streak.keys} keys during that streak, lasting ${duration}`
    });

    notification.show();
  }


  streak.active = false;
  streak.keys = 0;
}

function registerShortcut() {
  if (isMenuBarOpen) {
    mb.hideWindow();
  } else {
    mb.showWindow();
  }
}

const ready = () => {
  let index = 0;

  ioHook.on('keyup', handleKeyboardEvent);

  ioHook.on('mousemove', handleMouseEvent);
  ioHook.on('mouseclick', handleMouseEvent);
  ioHook.on('mousedrag', handleMouseEvent);
  ioHook.on('mousewheel', handleMouseEvent);

  ioHook.start();

  globalShortcut.register('CommandOrControl+K', registerShortcut);

}

const callback = () => {
  console.log('window created')

  // Specify entry point
  mb.window.loadURL(url.format({
    pathname: path.join(__dirname, 'dist/index.html'),
    protocol: 'file:',
    slashes: true
  }));


  // mb.window.openDevTools()
}

mb.on('ready', ready);
mb.on('after-show', () => { isMenuBarOpen = true; });
mb.on('after-hide', () => { isMenuBarOpen = false; });
mb.on('after-create-window', callback)
