const express = require('express');
const { app, BrowserWindow } = require('electron');
const path = require('path');
const storage = require('electron-json-storage');

let win;

const dev = false;

async function createWindow() {
    const server = express();
    server.use(express.static(path.join(__dirname, '..', 'build')));

    const listener = server.listen(0);
    const port = listener.address().port;

    win = new BrowserWindow({
        width: 1200,
        height: 675,
        title: 'Drivers Hub by CHub',
        icon: path.join(__dirname, 'logo.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    if (!dev) {
        win.setMenuBarVisibility(false);
        win.webContents.setIgnoreMenuShortcuts(true);
        win.webContents.on('devtools-opened', () => {
            win.webContents.closeDevTools();
        });
    }

    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        const url = new URL(details.url);
        if (url.hostname.startsWith("drivershub") && url.hostname.endsWith('charlws.com')) {
            // Create a new responseHeaders object without the original Access-Control-Allow-Origin header
            const responseHeaders = Object.fromEntries(
                Object.entries(details.responseHeaders).filter(([headerName]) =>
                    headerName.toLowerCase() !== 'access-control-allow-origin'
                )
            );

            callback({
                responseHeaders: {
                    ...responseHeaders,
                    'Access-Control-Allow-Origin': [`http://localhost:${port}`]
                }
            });
        } else {
            callback({ responseHeaders: details.responseHeaders });
        }
    });

    win.on('close', (e) => {
        e.preventDefault();

        win.webContents.executeJavaScript('Object.keys(localStorage);', true)
            .then(keys => {
                const promises = keys.map(key => {
                    return win.webContents.executeJavaScript(`localStorage.getItem("${key}");`, true)
                        .then(value => {
                            return [key, value];
                        });
                });

                Promise.all(promises).then(keyValues => {
                    const data = Object.fromEntries(keyValues);
                    storage.set('localStorage', data, (error) => {
                        if (error) throw error;
                        win.destroy();
                    });
                });
            });
    });

    let isReloaded = false;
    win.loadURL(`http://localhost:${port}`);
    if (dev) {
        win.webContents.openDevTools();
    }
    win.webContents.on('did-finish-load', () => {
        if (!isReloaded) {
            storage.get('localStorage', (error, data) => {
                if (error) throw error;
                for (const key in data) {
                    win.webContents.executeJavaScript(`localStorage.setItem("${key}", "${data[key]}");`, true)
                        .then(() => {
                            win.webContents.reload();
                            isReloaded = true;
                        });
                }
            });
        }
    });

    win.webContents.on("before-input-event",
        (event, input) => {
            if (input.code == 'F4' && input.alt)
                app.quit();
        }
    );
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});