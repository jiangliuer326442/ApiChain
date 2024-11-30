import { BrowserWindow } from 'electron';
import FileReadInitFunc from './fileread';
import userInitFunc from './user';
import windowInitFunc from './window';
import MarkdownInitFunc from './markdown';
import PostManInitFunc from './postman';
import UpdaterInitFunc from './updater';
import ProductInitFunc from './product';
import VipInitFunc from './vip';
import MockServerInitFunc from './mockserver';
import NetworkSendInitFunc from './network';

export default function (mainWindow : BrowserWindow){
    FileReadInitFunc(mainWindow);
    userInitFunc();
    windowInitFunc(mainWindow);
    MarkdownInitFunc(mainWindow);
    PostManInitFunc();
    UpdaterInitFunc();
    ProductInitFunc();
    VipInitFunc();
    MockServerInitFunc(mainWindow);
    NetworkSendInitFunc();
}