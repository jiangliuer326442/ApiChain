import Store from 'electron-store';

import { BrowserWindow } from 'electron';
import MarkdownInitFunc from './markdown';
import PostManInitFunc from './postman';
import UpdaterInitFunc from './updater';
import TopupInitFunc from './topup';
import TeamInitFunc from './team';
import MockServerInitFunc from './mockserver';
import NetworkSendInitFunc from './network';
import dbInitFunc from './database';
import reloadFunc from './system/reload';

export default function (mainWindow : BrowserWindow, privateKey : string, publicKey : string, store : Store){
    dbInitFunc(mainWindow);
    MarkdownInitFunc(mainWindow, store);
    PostManInitFunc();
    UpdaterInitFunc();
    TopupInitFunc(privateKey, publicKey, store);
    TeamInitFunc(privateKey, store);
    MockServerInitFunc(mainWindow, store);
    NetworkSendInitFunc(privateKey, store);
    reloadFunc(mainWindow);
}