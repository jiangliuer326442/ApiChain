import { BrowserWindow } from 'electron';
import userInitFunc from './user';
import windowInitFunc from './window';
import MarkdownInitFunc from './markdown';
import PostManInitFunc from './postman';
import UpdaterInitFunc from './updater';
import ProductInitFunc from './product';
import VipInitFunc from './vip';
import MockServerInitFunc from './mockserver';
import NetworkSendInitFunc from './network';
import dbInitFunc from './database';

export default function (mainWindow : BrowserWindow){
    userInitFunc();
    dbInitFunc(mainWindow);
    windowInitFunc(mainWindow);
    MarkdownInitFunc(mainWindow);
    PostManInitFunc();
    UpdaterInitFunc();
    ProductInitFunc();
    VipInitFunc();
    MockServerInitFunc(mainWindow);
    NetworkSendInitFunc();
}