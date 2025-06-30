import { BrowserWindow } from 'electron';
import MarkdownInitFunc from './markdown';
import PostManInitFunc from './postman';
import UpdaterInitFunc from './updater';
import VipInitFunc from './vip';
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
    VipInitFunc();
    TeamInitFunc();
    MockServerInitFunc(mainWindow);
    NetworkSendInitFunc();
    restartFunc();
    reloadFunc(mainWindow);
}