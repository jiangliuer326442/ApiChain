import fse from 'fs-extra';
import { dialog } from 'electron';
import chalk from 'chalk';
import log from 'electron-log';

import { uuidExists, getUuid, getUname, getSalt } from '../store/config/user';
import { isVip, getExpireTime, getBuyTimes } from '../store/config/vip';
import { osLocale } from '../third_party/os-locale';
import { 
    getIpV4,
    getPackageJson, 
    resolveHtmlPath,
    base64Encode,
} from '../util/util';

export async function getInitParams() : Promise<string[]> {
    let _btime = Date.now();
    let packageJsonPath = getPackageJson();
    let content = (await fse.readFile(packageJsonPath)).toString();
    let packageJson = JSON.parse(content);
    let lang = await osLocale();
    if (!uuidExists()) {
        dialog.showErrorBox("ssh key错误", "未找到ssh key 文件，清先在.ssh文件夹中生成rsa ssh key文件");
        process.exit(1);
    }

    let result = doGetInitParams(packageJson, lang);
    log.info("getInitParams finished, cost time: " + (Date.now() - _btime))
    return result;
}

function doGetInitParams(packageJson : any, lang : string) : string[] {
    let uuid = getUuid();
    let uname = getUname();
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