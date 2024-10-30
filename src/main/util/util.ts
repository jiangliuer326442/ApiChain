/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
import os from 'os';
import log from 'electron-log';

import { GLobalPort } from '../../config/global_config';

export function getIpV4() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
      for (const netInterface of interfaces[name]) {
          const { address, family, internal } = netInterface;
          if (family === 'IPv4' && !internal) {
              return address;
          }
      }
  }

  return "";
}

export function resolveHtmlPath(htmlFileName: string) {
  let port = process.env.FORMAL_PORT || GLobalPort;
  const url = new URL(`http://localhost:${port}`);
  if (process.env.NODE_ENV === 'development') {
    url.pathname = "proxy/" + htmlFileName;
  } else {
    url.pathname = htmlFileName;
  }
  return url.href;
}

export function getPackageJson() : string {
  let retPath ;
  if (app.isPackaged) {
    retPath = path.join(__dirname, '../../package.json')
  } else {
    retPath = path.join(__dirname, '../../../release/app/package.json')
  }
  return retPath;
}

export async function genUUID() {
  let si = require('systeminformation');
  let staticData = await si.getStaticData();
  let serial = {
    systemSerial: staticData.system.serial, //系统串号
    baseboardSerial: staticData.baseboard.serial, //主板串号
    chassisSerial: staticData.chassis.serial, //基座串号
  }
  let arr = await si.networkInterfaces();
  let networkInterfaceDefault = await si.networkInterfaceDefault();
  let [item] = arr.filter(v => v.iface == networkInterfaceDefault);
  serial.mac = item.mac;
  let serialNumStr = JSON.stringify(serial);
  let crypto = require('crypto');
  let serialHash = crypto.createHash('sha256').update(serialNumStr).digest('hex');
  return serialHash;
}

const RESOURCES_PATH = app.isPackaged
? path.join(process.resourcesPath, 'assets')
: path.join(__dirname, '../../../assets');

export function getAssetPath(...paths: string[]): string {
  return path.join(RESOURCES_PATH, ...paths);
}

export function base64Encode(data : string) : string {
  const base64Str = Buffer.from(data).toString('base64');
  return base64Str;
}

export function base64Decode(base64Str : string) : string {
  const decodedStr = Buffer.from(base64Str, 'base64').toString();
  return decodedStr;
}