// Minimal preload (keeps contextIsolation). Expose safe APIs here if needed.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // placeholder: add APIs if you need to bridge native features
});
