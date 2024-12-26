/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
import os from 'os';
import crypto from 'crypto';

import { GLobalPort } from '../../config/global_config';

export function getIpV4() {
  const interfacees = os.networkInterfaces();

  for (const name of Object.keys(interfacees)) {
      for (const netInterface of interfacees[name]) {
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

export function getAssetPath(...paths: string[]): string {
  const RESOURCES_PATH = app.isPackaged
? path.join(process.resourcesPath, 'assets')
: path.join(__dirname, '../../../assets');
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

export function md5(str : string) {
  return crypto.createHash('md5').update(str).digest('hex');
}