import { app } from 'electron';
import log from 'electron-log';
import path from 'path';
import fs from 'fs-extra';

import { base64Encode, base64Decode } from '../../util/util';

let dataBase64Decode = "";

const userData = app.getPath("userData");
export const uuidPath = path.join(userData, "uuid");

export function writeFile(uuid : string, salt : string) : void {
    let content = base64Encode(uuid + ":" + salt);
    log.info("writeFile:" + uuidPath + "|" + content);
    fs.writeFileSync(uuidPath, content);
}

export function getSalt() : string {
    if (dataBase64Decode === "") {
        let dataBase64 = fs.readFileSync(uuidPath).toString();
        dataBase64Decode = base64Decode(dataBase64);
    }
    let salt = dataBase64Decode.split(":")[1];
    return salt;
}