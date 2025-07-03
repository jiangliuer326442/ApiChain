/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
import os from 'os';
import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs-extra';

import { GLobalPort, REQUEST_METHOD_POST, REQUEST_METHOD_GET } from '../../config/global_config';

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

let packageJson = "";
export async function getPackageJson() {
  if (packageJson === "") {
    let retPath ;
    if (app.isPackaged) {
      retPath = path.join(__dirname, '../../package.json')
    } else {
      retPath = path.join(__dirname, '../../../package.json')
    }

    let content = (await fs.readFile(retPath)).toString();
    packageJson = JSON.parse(content);
  }

  return packageJson;
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

const publicKeyPath = path.join(app.getPath("home"), '.ssh', 'id_rsa.pub');

export function uuidExists() : boolean {
    return fs.pathExistsSync(publicKeyPath);
}

let publicKeyContent = "";
export function readPublicKey() {
    if (publicKeyContent === "") {
        let uuid = (fs.readFileSync(publicKeyPath)).toString();
        publicKeyContent = uuid;
    }

    return publicKeyContent;
}

export async function doRequest(method : any, url : string, headData : any, postData : any, fileData : any, cookieMap : any) {
  let response = null;
  let errorMessage = "";
  let hasError = false;

  if (method === REQUEST_METHOD_GET) {
      response = await axios.get(url, {
          headers: headData,
          maxRedirects: 0,
      }).catch(async error => {
          hasError = true;
          // 检查错误是否是重定向
          if ('response' in error && 'status' in error.response && error.response.status === 302) {
              handleCookie(error.response, cookieMap);
              url = error.response.headers.location;
              return await doRequest(method, url, headData, postData, fileData, cookieMap);
          } else {
              errorMessage = error.message;
              return [url, error.response, error.message];
          }
      });
  } else if (method === REQUEST_METHOD_POST) {
      if (fileData === null) {
          response = await axios.post(url, postData, {
              headers: headData,
              maxRedirects: 0,
          }).catch(async error => {
              hasError = true;
              // 检查错误是否是重定向
              if ('response' in error && 'status' in error.response && error.response.status === 302) {
                  handleCookie(error.response, cookieMap);
                  url = error.response.headers.location;
                  return await doRequest(method, url, headData, postData, fileData, cookieMap);
              } else {
                  errorMessage = error.message;
                  return [url, error.response, error.message];
              }
          });
      } else {
          let formData = new FormData();

          for (let _key in postData) {
              formData.append(_key, postData[_key]);
          }

          for (let _key in fileData) {
              let _file = fileData[_key];
              let _path = _file.path;
              const blob = fs.readFileSync(_path, null);
              const blobFile = new Blob([blob], { type: _file.type });  
              formData.append(_key, blobFile, _file.name);
          }

          response = await axios.post(url, formData, {
              headers: headData,
              maxRedirects: 0,
          }).catch(async error => {
              hasError = true;
              // 检查错误是否是重定向
              if ('response' in error && 'status' in error.response && error.response.status === 302) {
                  handleCookie(error.response, cookieMap);
                  url = error.response.headers.location;
                  return await doRequest(method, url, headData, formData, fileData, cookieMap);
              } else {
                  errorMessage = error.message;
                  return [url, error.response, error.message];
              }
          });
      }
  }
  if (response != null && !hasError) { 
      handleCookie(response, cookieMap);
  }
  return [url, response, ""];
}

function handleCookie(response : any, cookieMap : any) {
  if ('headers' in response && 'set-cookie' in response.headers) {
      for (let cookieRow of response.headers['set-cookie']) {
          let cookieArr = cookieRow.split('; ')[0].split("=");
          cookieMap.set(cookieArr[0], cookieArr[1]);
      }
  }
}