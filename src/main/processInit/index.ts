import { BrowserWindow } from 'electron';
import MarkdownInitFunc from './markdown';
import PostManInitFunc from './postman';
import UpdaterInitFunc from './updater';
import TopupInitFunc from './topup';
import TeamInitFunc from './team';
import MockServerInitFunc from './mockserver';
import NetworkSendInitFunc from './network';
import dbInitFunc from './database';
import restartFunc from './system/restart';
import reloadFunc from './system/reload';

export default function (mainWindow : BrowserWindow){
    dbInitFunc(mainWindow);
    MarkdownInitFunc(mainWindow);
    PostManInitFunc();
    UpdaterInitFunc();
    TopupInitFunc();
    TeamInitFunc();
    MockServerInitFunc(mainWindow);
    NetworkSendInitFunc();
    restartFunc();
    reloadFunc(mainWindow);
}