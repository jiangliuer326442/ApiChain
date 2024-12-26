import { 
    app, 
    BrowserWindow, 
    shell 
} from 'electron';
import path from 'path';
import log from 'electron-log';
import MenuBuilder from './menu';
import bindIpcEvents from '../processInit';

import { 
    getAssetPath,
    resolveHtmlPath,
} from '../util/util';
import { 
    WINDOW_WIDTH,
    WINDOW_HEIGHT, 
  } from '../../config/global_config';
import { isStarted } from './server';

let mainWindow: BrowserWindow;

export function createWindow(initParms : string[]) : BrowserWindow {
    mainWindow = new BrowserWindow({
        show: false,
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            enableWebSQL: false,
            webSecurity: false,
            preload: app.isPackaged
                ? path.join(__dirname, 'preload.js')
                : path.join(__dirname, '../../../.erb/dll/preload.js'),
            additionalArguments: initParms,
        },
    });

    const menuBuilder = new MenuBuilder();
    menuBuilder.buildMenu();

    bindMainWindowEvents();
    bindIpcEvents(mainWindow);

    return mainWindow;
}

export function bindMainWindowEvents() {
    log.info("serverStartFlg", isStarted());
    if (isStarted()) {
      mainWindow.loadURL(resolveHtmlPath('index.html'));
    }
  
    mainWindow.on('ready-to-show', () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) {
        mainWindow.minimize();
      } else {
        mainWindow.show();
      }
    });
  
    mainWindow.webContents.on('will-navigate', (event, url) => {
      event.preventDefault()
    })
  
    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
      });
    
    mainWindow.webContents.on('will-navigate', event =>{
        if(!event.isSameDocument) {
            event.preventDefault();
            let url = event.url;
            shell.openExternal(url);
        }
    });
}

export function getWindow() : BrowserWindow {
    return mainWindow;
}