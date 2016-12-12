/*****************************************************************************************************************
Programmed by: Christopher Franklyn
Description: This file instantiates the settup for the electron window app.
certain variables of the program can be changed through this file.
Last Modified: 12/12/2016
******************************************************************************************************************/

const electron = require('electron');
const {app, BrowserWindow} = electron;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  var win = new BrowserWindow({
    width:1100, height: 770,
    minHeight: 715,
    //maxWidth: 1100,
    autoHideMenuBar: true,
    useContentSize: true
    //resizable: false
  });
  win.loadURL('file://' + __dirname + '/loginIndex.html');
  win.focus();
  //win.webContents.openDevTools(); //opens web dev tools in window
});
