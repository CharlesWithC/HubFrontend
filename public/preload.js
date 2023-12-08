const { contextBridge, ipcRenderer } = require('electron');
// contextBridge.exposeInMainWorld('host', 'hub.atmvtc.com'); // NOTE Only for custom build.
contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, data) => ipcRenderer.send(channel, data),
    },
});