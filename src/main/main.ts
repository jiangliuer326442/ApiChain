/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import log from 'electron-log';
import detectPort from 'detect-port';
import express from 'express';
import chalk from 'chalk';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { getMarkdownContentByIteratorId } from './processInit/markdown';
import { getRequestByIterator } from './processInit/mockserver';
import { GLobalPort, DevHtmlPort } from '../config/global_config';
import MenuBuilder from './menu';
import { resolveHtmlPath, getAssetPath } from './util/util';
import GlobalInitFunc from "./processInit/index";

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(log.error);
};

const startServer = (cb) => {
  let port = process.env.FORMAL_PORT || GLobalPort;
  detectPort(port, (_err, availablePort) => {
      if (port != availablePort) {
        throw new Error(
          chalk.whiteBright.bgRed.bold(
            `Port "${port}" on "localhost" is already in use`,
          ),
        );
      }
      let app = express();
      let staticPath = "";
      if (process.env.NODE_ENV === 'development') {
        const apiProxy = createProxyMiddleware({  
          target: 'http://localhost:' + DevHtmlPort + '/proxy/',
        });
        app.use('/proxy', apiProxy); 
        app.use('/ws', apiProxy); 
      } else {
        staticPath = path.resolve(__dirname, '../renderer/');
        app.use(express.static(staticPath));  
      }
      app.use(express.urlencoded({ extended: true }));
      app.get('/mockserver/:iteratorId/:project/*', (req, res) => {
        let iteratorId = req.params.iteratorId;
        let project = req.params.project;
        let uri = req.originalUrl.split("/").slice(4).join("/");
        let method = req.method;
        getRequestByIterator(iteratorId, project, method, uri, res);
      });
      app.post('/mockserver/:iteratorId/:project/*', (req, res) => {
        let iteratorId = req.params.iteratorId;
        let project = req.params.project;
        let uri = req.originalUrl.split("/").slice(4).join("/");
        let method = req.method;
        getRequestByIterator(iteratorId, project, method, uri, res);
      });
      app.post('/sprint/docs', (req, res) => {
        let iteratorId = req.body.iteratorId;
        getMarkdownContentByIteratorId(iteratorId, res);
      });
      app.get('*', (req, res) => {
        if (process.env.NODE_ENV !== 'development') {
          res.sendFile(path.join(staticPath, 'index.html'));
        }
      });
      app.listen(port, () => {  
          cb();
      });
  });
}

const createWindow = async () => {
  // if (isDebug) {
  //   await installExtensions();
  // }

  mainWindow = new BrowserWindow({
    show: true,
    width: 1124,
    height: 738,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

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
    console.log(`试图跳转到: ${url}`)
    // 你可以在这里添加你的逻辑来处理重定向
    // 如果你想要重定向到一个新的页面，你可以使用 loadURL 方法
    // win.loadURL('http://new-url.com')
  })

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
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

  GlobalInitFunc(mainWindow);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    startServer(() => {
      createWindow(); 
    });
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(log.error);
