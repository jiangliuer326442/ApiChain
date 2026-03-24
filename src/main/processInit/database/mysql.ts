import { ipcMain, BrowserWindow } from "electron";
import Store from 'electron-store';
import mysql from 'mysql2';

import { langTrans } from '../../../lang/i18n';
import {
    rsaDecrypt
} from '../../util/util';
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
} from '../../store/config/team'


export default function (privateKey : string, mainWindow : BrowserWindow, store : Store) {
    ipcMain.on(ChannelsDatabaseStr, async (event, action, dbConfig, sql, sqlParams) => {
        if(action !== ChannelsDatabaseQuery) return;

        const clientType = getClientType(store);
        let connection;
        if (clientType === CLIENT_TYPE_SINGLE) {
            dbConfig['db_password'] = rsaDecrypt(dbConfig['db_password'], privateKey);
        }
        connection = mysql.createConnection({
            host: dbConfig['db_host'],
            port: dbConfig['db_port'],
            user: dbConfig['db_username'],
            password: dbConfig['db_password'],
            database: dbConfig['db_name'],
        });

        connection.connect((err) => {
            if (err) {
                mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseQueryResult, false, langTrans("database connect error"), null);
                return;
            }
            connection.query(sql, sqlParams, (err, results) => {
                if (err) {
                    mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseQueryResult, false, langTrans("database sql error"), null);
                    return;
                }
                const firstRecord = results.length > 0 ? results[0] : {};
                const serializableData = JSON.parse(JSON.stringify(firstRecord));
                mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseQueryResult, true, "", serializableData);
            });
        });
    });
}