import fse from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import log from 'electron-log';

import { registerUser, storeRegisterData, getUUID, getUName, getRTime } from '../store/config/user';
import { isVip, getExpireTime, getBuyTimes } from '../store/config/vip';
import { osLocale } from '../third_party/os-locale';
import { 
    genUUID, 
    getIpV4,
    getPackageJson, 
    resolveHtmlPath,
    base64Encode,
} from '../util/util';
import { uuidPath, writeFile } from '../processInit/uuid';

export async function getInitParams() : Promise<string[]> {
    let _btime = Date.now();
    let path = getPackageJson();
    let content = await fse.readFile(path);
    let packageJson = JSON.parse(content.toString());
    let lang = await osLocale();

    let result;
    let fileExistFlg = await fse.pathExists(uuidPath);
    //已经注册过
    if (fileExistFlg) {
        result = doGetInitParams(packageJson, lang);
    } else {
        let uuid = await genUUID();
        let salt = uuidv4() as string;
        registerUser(uuid);
        writeFile(uuid, salt, () => {
            storeRegisterData(salt);
        });
        result = doGetInitParams(packageJson, lang);
    }
    log.info("getInitParams finished, cost time: " + (Date.now() - _btime))
    return result;
}

async function doGetInitParams(packageJson : any, lang : string) : string[] {
    let uuid = getUUID();
    let uname = getUName();
    let rtime = getRTime();
    let ip = getIpV4();
    let vipFlg = isVip();
    let expireTime = getExpireTime();
    let buyTimes = getBuyTimes();
    let html = resolveHtmlPath('index.html');
    let appVersion = packageJson.version;
    let appName = packageJson.name;
    let userLang = lang.split("-")[0];
    let userCountry = lang.split("-")[1];

    return [
        "$$" + base64Encode("uuid=" + uuid),
        "$$" + base64Encode("uname=" + uname),
        "$$" + base64Encode("rtime=" + rtime),
        "$$" + base64Encode("ip=" + ip),
        "$$" + base64Encode("vipFlg=" + vipFlg),
        "$$" + base64Encode("expireTime=" + expireTime),
        "$$" + base64Encode("buyTimes=" + buyTimes),
        "$$" + base64Encode("html=" + html),
        "$$" + base64Encode("appVersion=" + appVersion),
        "$$" + base64Encode("appName=" + appName),
        "$$" + base64Encode("userLang=" + userLang),
        "$$" + base64Encode("userCountry=" + userCountry),
    ];
}