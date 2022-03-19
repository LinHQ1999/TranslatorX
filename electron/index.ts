import {app, BrowserWindow, ipcMain, Notification} from 'electron';
import isDev from 'electron-is-dev';
import {join} from 'path';
import {trans_state, translate} from './translator';
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

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

/**
 * 不要返回嵌套的 Promise
 */
ipcMain.handle("translate", async (_, from: string, lang: Config) => {
    try {
        let res = await translate(from, lang)
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
