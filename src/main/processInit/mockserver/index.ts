import log from 'electron-log';
import { ipcMain, BrowserWindow } from 'electron'

import {
    ChannelsMockServerStr,
    ChannelsMockServerLongStr,
    ChannelsMockServerQueryStr,
    ChannelsMockServerAccessSetStr,
    ChannelsMockServerAccessGetStr,
    ChannelsMockServerAccessSetResultStr,
    ChannelsMockServerQueryResultStr,
} from '../../../config/channel';

import { 
    TABLE_VERSION_ITERATION_FIELDS, 
    TABLE_VERSION_ITERATION_REQUEST_FIELDS 
} from '../../../config/db';

let iteration_request_response_demo = TABLE_VERSION_ITERATION_REQUEST_FIELDS.FIELD_RESPONSE_DEMO;

import { isVip } from '../../store/config/vip';

import {
    setAccess,
    getAccess
} from '../../store/config/mockserver';

let version_iterator_uuid = TABLE_VERSION_ITERATION_FIELDS.FIELD_UUID;
let version_iterator_open = TABLE_VERSION_ITERATION_FIELDS.FIELD_OPENFLG;
let version_iterator_del = TABLE_VERSION_ITERATION_FIELDS.FIELD_DELFLG;

let window : BrowserWindow;

let iteratorId;

let res;

export function getRequestByIterator(paramIteratorId : string, paramProjectId : string, paramMethod : string, paramUri : string, paramRes) {

    window.webContents.send(ChannelsMockServerLongStr, ChannelsMockServerQueryStr, paramIteratorId, paramProjectId, paramMethod, paramUri);

    iteratorId = paramIteratorId;
    res = paramRes;
}

export default function (mainWindow : BrowserWindow) {

    window = mainWindow;

    //设置mock 服务器 可见性
    ipcMain.on(ChannelsMockServerStr, (event, action : string,  iteratorId : string, visibility : boolean) => {
        if (action !== ChannelsMockServerAccessSetStr) return;
        setAccess(iteratorId, visibility);
        event.reply(ChannelsMockServerStr, ChannelsMockServerAccessSetResultStr, iteratorId, visibility);
    });

    //获取mock 服务器 可见性
    ipcMain.on(ChannelsMockServerStr, (event, action : string,  iteratorId : string) => {
        if (action !== ChannelsMockServerAccessGetStr) return;
        let access = getAccess(iteratorId);
        event.reply(ChannelsMockServerStr, ChannelsMockServerAccessSetResultStr, iteratorId, access);
    });

    //查询文档内容
    ipcMain.on(ChannelsMockServerLongStr, (event, action, versionIteration, version_iteration_requests) => {
        if (action !== ChannelsMockServerQueryResultStr) return;
        //迭代已经关闭，没有权限
        if (versionIteration === undefined || versionIteration[version_iterator_del] === 1 || versionIteration[version_iterator_open] === 0) {
            const data = {
                code: 404,
                message: '该迭代已关闭',
            };
            res.json(data);
            return;
        }

        //不是会员，迭代文档停止共享
        if (!isVip()) {
            const data = {
                code: 403,
                message: '对方没有开通会员，已停止迭代文档的共享',
            };
            res.json(data);
            return;
        }

        let iterationUUID = versionIteration[version_iterator_uuid];
        if (iterationUUID === iteratorId) {
            let access = getAccess(iterationUUID);
            if (!access) {
                const data = {
                    code: 403,
                    message: '该迭代mock 服务器已关闭',
                };
                res.json(data);
                return;
            }
            res.json(JSON.parse(version_iteration_requests[0][iteration_request_response_demo]));
        } else {
            const data = {
                code: 500,
                message: '服务器错误',
            };
            res.json(data);
            return;
        }
    });
}