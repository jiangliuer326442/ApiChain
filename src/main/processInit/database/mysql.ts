import { ipcMain, BrowserWindow } from "electron";
import log from 'electron-log';
import Store from 'electron-store';
import mysql from 'mysql2/promise';

import { langTrans } from '../../../lang/i18n';
import {
    rsaDecrypt
} from '../../util/util';
import { 
    ChannelsDatabaseStr, 
    ChannelsDatabaseQuery,
    ChannelsDatabaseQueryResult,
    ChannelsDatabaseExecute,
    ChannelsDatabaseExecuteFinish,
} from '../../../config/channel';


export default function (privateKey : string, mainWindow : BrowserWindow, store : Store) {
    ipcMain.on(ChannelsDatabaseStr, async (event, action, dbConfig, sql, sqlParams) => {
        if(action !== ChannelsDatabaseQuery) return;

        dbConfig['db_password'] = rsaDecrypt(dbConfig['db_password'], privateKey);
        let connection;
        try {
            // 1. 创建连接（Promise 写法）
            connection = await mysql.createConnection({
                host: dbConfig['db_host'],
                port: dbConfig['db_port'],
                user: dbConfig['db_username'],
                password: dbConfig['db_password'],
                database: dbConfig['db_name'],
            });

            // 2. 检查 SQL 语句是否为 SELECT 查询
            if (!sql.trim().toUpperCase().startsWith('SELECT')) {
                mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseQueryResult, false, langTrans("database query sql error"), null);
                return;
            }

            // 2. 执行 SQL（mysql2/promise 直接返回 [results, fields]）
            const [results] = await connection.query(sql, sqlParams);

            const firstRecord = results.length > 0 ? results[0] : {};
            const serializableData = JSON.parse(JSON.stringify(firstRecord));

            mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseQueryResult, true, "", serializableData);

        } catch (err) {
            // 统一捕获：连接失败 / SQL 错误
            log.error('数据库错误:', err);
            if (err.message.includes('connect')) {
                // 连接错误
                mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseQueryResult, false, langTrans("database connect error"), null);
            } else {
                // SQL 执行错误
                mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseQueryResult, false, langTrans("database sql error"), null);
            }

        } finally {
            // 4. 无论成功失败，都要关闭连接（重要！）
            if (connection) {
                await connection.end();
            }
        }
    });

    ipcMain.on(ChannelsDatabaseStr, async (event, action, dbConfig, sql, sqlParams) => {
        if(action !== ChannelsDatabaseExecute) return;

        dbConfig['db_password'] = rsaDecrypt(dbConfig['db_password'], privateKey);
        let connection;
        try {
            // 1. 创建连接（Promise 写法）
            connection = await mysql.createConnection({
                host: dbConfig['db_host'],
                port: dbConfig['db_port'],
                user: dbConfig['db_username'],
                password: dbConfig['db_password'],
                database: dbConfig['db_name'],
            });

            // 2. 检查 SQL 语句是否为 SELECT 查询
            // 去除首尾空格并转大写
            const sqlUpper = sql.trim().toUpperCase();

            // 校验：必须以 DELETE 或 UPDATE 开头 + 必须包含 WHERE
            if (!(sqlUpper.startsWith('DELETE') || sqlUpper.startsWith('UPDATE')) || !sqlUpper.includes('WHERE')) {
                mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseExecuteFinish, false, langTrans("database query sql error"));
                return;
            }

            // 2. 执行 SQL（mysql2/promise 直接返回 [results, fields]）
            await connection.execute(sql, sqlParams);

            mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseExecuteFinish, true, "");

        } catch (err) {
            // 统一捕获：连接失败 / SQL 错误
            log.error('数据库错误:', err);
            if (err.message.includes('connect')) {
                // 连接错误
                mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseExecuteFinish, false, langTrans("database connect error"));
            } else {
                // SQL 执行错误
                mainWindow.webContents.send(ChannelsDatabaseStr, ChannelsDatabaseExecuteFinish, false, langTrans("database sql error"));
            }

        } finally {
            // 4. 无论成功失败，都要关闭连接（重要！）
            if (connection) {
                await connection.end();
            }
        }
    });
}