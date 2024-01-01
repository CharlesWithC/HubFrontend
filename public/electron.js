const express = require('express');
const history = require('connect-history-api-fallback');
const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, Notification, ipcMain, shell, dialog } = require('electron');
const storage = require('electron-json-storage');
const { autoUpdater } = require('electron-updater');

const DiscordRPC = require('discord-rpc');
let rpc = new DiscordRPC.Client({ transport: 'ipc' });

let win;

const debug = false;
let browserAuth = false;
let receivedNoti = []; // notificationid
let presenceMode = "init";
let rpcReady = -1;

let lockDomain = false;
let config = { name: "Drivers Hub", discordClientID: "997847494933368923" };
const configPath = path.join(__dirname, 'electron-config.json');
if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configData);
    if (config.domain !== undefined && config.domain !== null && config.domain !== "") {
        lockDomain = config.domain;
    }
}
app.setName(config.name);
app.setAppUserModelId(config.name);

function removeMarkdown(content) {
    let result = content;
    result = result.replace(/(\*\*|__) (.+?) (\*\*|__)/g, '$2');
    result = result.replace(/(\*|_) (.+?) (\*|_)/g, '$2');
    result = result.replace(/`(.+?)`/g, '$1');
    result = result.replace(/~~(.+?)~~/g, '$1');
    result = result.replace(/\[(.+?)\]\(.+?\)/g, '$1');
    return result;
}

async function createWindow() {
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

    win = new BrowserWindow({
        width: 1200,
        height: 675,
        minWidth: 960,
        minHeight: 520,
        title: config.name,
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

    win.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        if (details.url.includes('charlws.com')) {
            details.requestHeaders['User-Agent'] = `Drivers Hub Desktop v${app.getVersion()}`;
        }
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
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

    win.webContents.on("before-input-event", (event, input) => {
        if (input.code == 'F4' && input.alt) {
            const windows = BrowserWindow.getAllWindows();
            windows.forEach(win => {
                win.close();
            });
            app.quit();
        }
        if (input.control && input.key.toLowerCase() === 'r') {
            win.webContents.reload();
        }
    });

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
                        try {
                            return win.webContents.executeJavaScript(`localStorage.setItem("${key}", "${data[key].replace('"', '\"')}");`, true);
                        } catch {
                            return true;
                        }
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
    }

    const isPortable = 'PORTABLE_EXECUTABLE_DIR' in process.env;
    if (!isPortable) {
        autoUpdater.setFeedURL({
            provider: 'generic',
            url: 'https://dl.chub.page/' + config.build + '/',
        });
        // autoUpdater.autoDownload = true;
        autoUpdater.autoDownload = false;

        autoUpdater.on('update-available', () => {
            dialog.showMessageBox(win, {
                type: 'info',
                title: 'Update Available',
                message: 'A new version of the application is available. You should download the new installer from the Drivers Hub and run it to apply updates.'
            });
        });

        autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
            dialog.showMessageBox(win, {
                type: 'info',
                buttons: ['Restart Now', 'Restart Later'],
                title: 'Application Update',
                message: process.platform === 'win32' ? releaseNotes : releaseName,
                detail: 'A new version has been downloaded. Restart the application to apply the updates.'
            }).then((returnValue) => {
                if (returnValue.response === 0) autoUpdater.quitAndInstall();
            });
        });

        autoUpdater.on('error', (error) => {
            dialog.showMessageBox(win, {
                type: 'error',
                title: 'Update Error',
                message: 'An error occurred while checking for updates.',
                detail: error.toString()
            });
        });

        autoUpdater.checkForUpdatesAndNotify();
    }
});

app.on('second-instance', () => {
    let win = BrowserWindow.getAllWindows()[0];
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
    }
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

function doRPCLogin() {
    rpcReady = 0;
    try {
        rpc.login({ clientId: config.discordClientID }).catch(console.error);
        rpc.on('ready', () => {
            rpcReady = 1;
            if (presenceMode === "full") {
                rpc.setActivity(curPresence.details !== undefined ? curPresence : {
                    details: 'Launching...',
                    largeImageKey: 'https://drivershub.charlws.com/images/logo.png',
                    startTimestamp: new Date(),
                    instance: false,
                    buttons: config.discordClientID === "997847494933368923" ? [
                        { label: 'Powered by CHub', url: "https://drivershub.charlws.com/" }
                    ] : []
                });
            } else if (presenceMode === "basic") {
                rpc.setActivity({
                    startTimestamp: new Date(),
                    instance: false
                });
            }
        });
    } catch {
        console.warn("Failed to initiate Discord RPC");
    }
}
let lastPresence = null; // note, must be different from curPresence
let curPresence = {};
ipcMain.on('presence-update', (event, data) => {
    try {
        if (config.discordClientID !== "997847494933368923") {
            // remove powered by CHub for custom RPC
            data.buttons = [data.buttons[0]];
        }
        if (data !== curPresence) {
            if (curPresence !== lastPresence) {
                lastPresence = JSON.parse(JSON.stringify(curPresence));
            }
            curPresence = { ...JSON.parse(JSON.stringify(data)), startTimestamp: new Date() };
        }
        if (presenceMode === "full") rpc.setActivity(data);
    } catch {
        console.warn("Failed to update Discord RPC");
    }
});
ipcMain.on('presence-revert', (event, data) => {
    try {
        if (!rpc.ready || lastPresence === null || presenceMode !== "full") return;
        rpc.setActivity({ ...lastPresence, startTimestamp: new Date() });
    } catch {
        console.warn("Failed to update Discord RPC");
    }
});
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function updatePresenceSettings(data, depth = 0) {
    try {
        if (presenceMode === data) return;
        if (rpcReady === -1 && data !== "none") doRPCLogin();
        if (rpcReady !== 1) {
            if (depth === 10) return;
            await sleep(1000);
            return updatePresenceSettings(data, depth + 1);
        }
        presenceMode = data;
        if (presenceMode === "none") {
            await rpc.setActivity({ instance: false });
            await rpc.clearActivity();
        } else if (presenceMode === "basic") {
            await rpc.setActivity({ startTimestamp: new Date(), instance: false });
        } else if (presenceMode === "full") {
            await rpc.setActivity(curPresence);
        }
    } catch {
        console.warn("Failed to update Discord RPC");
    }
}
ipcMain.on('presence-settings', async (event, data) => {
    updatePresenceSettings(data);
});
ipcMain.on('notification', (event, data) => {
    if (receivedNoti.includes(data.id)) return;
    receivedNoti.push(data.id);
    if (receivedNoti.includes(-1) && data.id !== -1) {
        // when -1 is in receivedNoti, then the first batch is over
        // we'll only look for new notifications after the client started
        const notification = {
            title: 'Drivers Hub',
            body: removeMarkdown(data.message)
        };
        new Notification(notification).show();
    }
});
ipcMain.handle('open-file-dialog', async (event, extensions) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Files', extensions }]
    });
    function getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.png':
                return 'image/png';
            case '.gif':
                return 'image/gif';
            case '.bmp':
                return 'image/bmp';
            case '.webp':
                return 'image/webp';
            case '.svg':
                return 'image/svg+xml';
            case '.csv':
                return 'text/csv';
            default:
                return 'application/octet-stream';
        }
    }
    if (!result.canceled) {
        const filePath = result.filePaths[0];
        const fileBuffer = fs.readFileSync(filePath);
        const fileBase64 = fileBuffer.toString('base64');
        const mimeType = getMimeType(filePath);
        const dataUrl = `data:${mimeType};base64,${fileBase64}`;
        return dataUrl;
    }
});