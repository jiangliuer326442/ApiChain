import { BrowserWindow } from 'electron';
import MarkdownInitFunc from './markdown';
import PostManInitFunc from './postman';
import UpdaterInitFunc from './updater';
import VipInitFunc from './vip';
import MockServerInitFunc from './mockserver';
import NetworkSendInitFunc from './network';
import dbInitFunc from './database';

export default function (mainWindow : BrowserWindow){
    dbInitFunc(mainWindow);
    MarkdownInitFunc(mainWindow);
    PostManInitFunc();
    UpdaterInitFunc();
    VipInitFunc();
    MockServerInitFunc(mainWindow);
    NetworkSendInitFunc();
}