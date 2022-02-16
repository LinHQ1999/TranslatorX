import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import isDev from 'electron-is-dev';
import { join } from 'path';
import { trans_state, translate } from './translator';
import {error} from 'electron-log';

let tlwindow: BrowserWindow = null

function createWindow() {
  // Create the browser window.
  tlwindow = new BrowserWindow({
    width: 900,
    height: 600,
    //  change to false to use AppBar
    frame: true,
    show: true,
    autoHideMenuBar: true,
    // resizable: false,
    fullscreenable: true,
    title: "TranslateX",
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  });

  const port = process.env.PORT || 3000;
  const url = isDev ? `http://localhost:${port}` : join(__dirname, "..", "src", "out", "index.html");

  // and load the index.html of the app.
  if (isDev) {
    tlwindow?.loadURL(url);
  } else {
    tlwindow?.loadFile(url);
  }
  // Open the DevTools.
  // tlwindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// listen the channel `message` and resend the received message to the renderer process
// ipcMain.on('message', (event: IpcMainEvent, message: any) => {
//   console.log(message);
//   setTimeout(() => event.sender.send('message', 'hi from electron'), 500);

/**
 * 不要返回嵌套的 Promise
 */
ipcMain.handle("translate", async (_, text: string, from: string, to: string) => {
  try {
    let res = await translate(text, from, to)
    return res
  } catch (err) {
    new Notification({title: "网络错误或者访问太频繁了！"}).show()
    error(err)
    return ""
  }
})

ipcMain.handle("ontop", (_, onTop: boolean) => {
  if (tlwindow) tlwindow.setAlwaysOnTop(onTop)
})

ipcMain.handle("trans_state", (_) => {
  return trans_state
})