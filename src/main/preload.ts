import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

import { 
  ChannelsUserInfo, 
  ChannelsOpenWindow, 
  ChannelsMarkdown,
  ChannelsMarkdownLong,
  ChannelsDb, 
  ChannelsPostman, 
  ChannelsAutoUpgrade,
  ChannelsVip, 
  ChannelssMockServer,
  ChannelssMockServerLong,
  ChannelsAxioBreidge,
  ChannelsDbLong,
  ChannelsTeam,
} from '../config/channel';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: ChannelsUserInfo | ChannelsOpenWindow | 
      ChannelsMarkdown | ChannelsMarkdownLong |
      ChannelsDb | ChannelsDbLong |
      ChannelsPostman | ChannelsAutoUpgrade | ChannelsVip | 
      ChannelssMockServer | ChannelssMockServerLong |
      ChannelsAxioBreidge | ChannelsTeam, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: ChannelsUserInfo | ChannelsOpenWindow | 
      ChannelsMarkdown |  ChannelsMarkdownLong |
      ChannelsDb |  ChannelsDbLong |
      ChannelsPostman | ChannelsAutoUpgrade | ChannelsVip | 
      ChannelssMockServer |  ChannelssMockServerLong |
      ChannelsAxioBreidge | ChannelsTeam, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: ChannelsUserInfo | ChannelsOpenWindow | 
      ChannelsMarkdown |  ChannelsMarkdownLong |
      ChannelsDb |  ChannelsDbLong |
      ChannelsPostman | ChannelsAutoUpgrade | ChannelsVip | 
      ChannelssMockServer |  ChannelssMockServerLong |
      ChannelsAxioBreidge | ChannelsTeam, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  getAdditionalArguments: () => {
    return process.argv.filter(arg => arg.startsWith('$$')).map((arg => arg.substring(2)));
  }
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;