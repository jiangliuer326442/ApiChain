import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

import { ChannelsUserInfo, ChannelsOpenWindow, ChannelsMarkdown, ChannelsDb, ChannelsPostman, ChannelsAutoUpgrade, ChannelsReadFile, ChannelsVip, ChannelssMockServer } from '../config/global_config';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: ChannelsUserInfo | ChannelsOpenWindow | ChannelsMarkdown | ChannelsDb | ChannelsPostman | ChannelsAutoUpgrade | ChannelsReadFile | ChannelsVip | ChannelssMockServer, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: ChannelsUserInfo | ChannelsOpenWindow | ChannelsMarkdown | ChannelsDb | ChannelsPostman | ChannelsAutoUpgrade | ChannelsReadFile | ChannelsVip | ChannelssMockServer, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: ChannelsUserInfo | ChannelsOpenWindow | ChannelsMarkdown | ChannelsDb | ChannelsPostman | ChannelsAutoUpgrade | ChannelsReadFile | ChannelsVip | ChannelssMockServer, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;