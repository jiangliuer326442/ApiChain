import { ipcMain, BrowserWindow } from "electron";
import Store from 'electron-store';
import mysql from 'mysql';

import {
    CLIENT_TYPE_SINGLE
} from '../../../config/team';
import { 
    ChannelsDatabaseStr, 
    ChannelsDatabaseQuery,
    ChannelsDatabaseQueryResult,
    ChannelsDatabaseExecute,
    ChannelsDatabaseExecuteFinish,
} from '../../../config/channel';

import {
    getClientType,
    getTeamId,
} from '../../store/config/team'


export default function (mainWindow : BrowserWindow, store : Store) {
    ipcMain.on(ChannelsDatabaseStr, async (event, action, dbConfig, sql, sqlParams) => {
        if(action !== ChannelsDatabaseQuery) return;

        const clientType = getClientType(store);
        let connection;
        if (clientType === CLIENT_TYPE_SINGLE) {
            //todo 进行数据库密码解密
            console.log("222222");
        } else {

            connection = mysql.createConnection({
                host: dbConfig['db_host'],
                port: dbConfig['db_port'],
                user: dbConfig['db_username'],
                password: dbConfig['db_password'],
                database: dbConfig['db_name'],
            });
        }

        connection.connect((err) => {
            if (err) {
                console.log("111111")
                mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseQueryResult, false, "连接数据库失败", null);
                return;
            }
            connection.query(sql, sqlParams, (err, results, fields) => {
                if (err) {
                    console.log("2222");
                    mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseQueryResult, false, "执行sql语句报错", null);
                    return;
                }
                const firstRecord = results.length > 0 ? results[0] : {};
                console.log("firstRecord", firstRecord);
                const serializableData = JSON.parse(JSON.stringify(firstRecord));
                console.log("serializableData", serializableData);
                mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseQueryResult, true, "", serializableData);
            });
        });
    });
}