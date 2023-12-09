const express = require('express');
const history = require('connect-history-api-fallback');
const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const storage = require('electron-json-storage');

const debug = false;
let browserAuth = false;

async function createWindow() {
    let lockDomain = false;
    let config;
    const configPath = path.join(__dirname, 'electron-config.json');
    if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(configData);
        if (config.domain !== undefined && config.domain !== null && config.domain !== "") {
            lockDomain = config.domain;
        }
    }

    const server = express();
    const REDIRECT_BACK = ['/auth/discord/callback', '/auth/steam/callback', '/auth/patreon/callback'];
    for (const route of REDIRECT_BACK) { // handle login callback
        server.get(route, (req, res, next) => {
            const userAgent = req.headers['user-agent'];
            const isElectron = userAgent && userAgent.includes('Electron');
            if (isElectron) next();
            else if (browserAuth) {
                const url = req.originalUrl;
                if (url && win) { win.loadURL(`http://localhost:${port}${url}`); win.focus(); }
                res.redirect("/auth/complete");
            }
        });
    }
    server.use((req, res, next) => { // drop browser access
        const userAgent = req.headers['user-agent'];
        const isElectron = userAgent && userAgent.includes('Electron');
        if (req.originalUrl.startsWith("/static")) next();
        else if (!isElectron && browserAuth && req.originalUrl === "/auth/complete") {
            browserAuth = false;
            next();
        }
        else if (isElectron) next();
    });
    server.use(history({ // handle non-root reload
        index: '/index.html'
    }));
    server.use(express.static(path.join(__dirname, '..', 'build')));

    const win = new BrowserWindow({
        width: 1200,
        height: 675,
        title: 'Drivers Hub',
        icon: path.join(__dirname, 'logo.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    if (!debug) {
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

    win.webContents.on("before-input-event",
        (event, input) => {
            if (input.code == 'F4' && input.alt) {
                const windows = BrowserWindow.getAllWindows();
                windows.forEach(win => {
                    win.close();
                });
                app.quit();
            }
        }
    );

    const listener = server.listen(0, 'localhost', () => {
        port = listener.address().port;
        win.loadURL(`http://localhost:${port}/wait`);
        let isReloaded = false;
        if (debug) {
            win.webContents.openDevTools();
        }
        win.webContents.on('did-finish-load', () => {
            if (!isReloaded) {
                storage.get('localStorage', (error, data) => {
                    if (error) throw error;
                    if (lockDomain !== false) {
                        data["domain"] = lockDomain;
                        data["locked"] = "true";
                    } else {
                        if (data["locked"] === "true") {
                            data["domain"] = "";
                        }
                        data["locked"] = "false";
                    }
                    const promises = Object.keys(data).map(key => {
                        return win.webContents.executeJavaScript(`localStorage.setItem("${key}", "${data[key]}");`, true);
                    });

                    Promise.all(promises)
                        .then(() => {
                            win.loadURL(`http://localhost:${port}`);
                            isReloaded = true;
                        });
                });
            }
        });
    });

    ipcMain.on('browser-auth', (event, data) => {
        browserAuth = true;
    });
    ipcMain.on('cancel-browser-auth', (event, data) => {
        browserAuth = false;
    });
    ipcMain.on('open-url', (event, data) => {
        try {
            let url = new URL(data);
            shell.openExternal(url.toString());
        } catch {
            return;
        }
    });
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

app.on('ready', () => {
    if (!app.requestSingleInstanceLock()) {
        app.quit();
    } else {
        createWindow();
    }
});

app.on('second-instance', () => {
    let win = BrowserWindow.getAllWindows()[0];
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});