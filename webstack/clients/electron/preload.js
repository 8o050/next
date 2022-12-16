const { ipcRenderer, contextBridge } = require('electron');

const validChannels = [
  'client-info-response',
  'client-info-request',
  'client-update-check',
  'request-sources',
  'set-source',
  'connect-url',
  'asynchronous-message',
  'close-connect-page',
  'take-screenshot',
  'streamview',
  'paint',
];

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, callback) => {
    if (validChannels.includes(channel)) {
      // Filtering the event param from ipcRenderer
      const newCallback = (_, data) => callback(data);
      ipcRenderer.on(channel, newCallback);
    }
  },
  once: (channel, callback) => {
    if (validChannels.includes(channel)) {
      const newCallback = (_, data) => callback(data);
      ipcRenderer.once(channel, newCallback);
    }
  },
  removeListener: (channel, callback) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback);
    }
  },
  removeAllListeners: (channel) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
});
