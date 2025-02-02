import fse from 'fs-extra';
import { dialog } from 'electron';
import log from 'electron-log';
import { langTrans, setLang } from '../../lang/i18n';
import { uuidExists, getUuid, getUname } from '../store/config/user';
import { isFirstLauch } from '../store/config/first';
import { isVip, getExpireTime, getBuyTimes, giftVip } from '../store/config/vip';
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

    if (process.env.NODE_ENV === 'development') {
        lang = 'en-AU';
    }
    let userLang = lang.split("-")[0];
    let userCountry = lang.split("-")[1];
    setLang(userCountry, userLang);

    if (!uuidExists()) {
        dialog.showErrorBox(langTrans("lack sshkey title"), langTrans("lack sshkey content"));
        process.exit(1);
    }

    let firstLauch = isFirstLauch();
    if (firstLauch) {
        giftVip(3);
    }

    let result = doGetInitParams(packageJson, userLang, userCountry, firstLauch);
    log.info("getInitParams finished, cost time: " + (Date.now() - _btime));
    return result;
}

function doGetInitParams(packageJson : any, userLang : string, userCountry : string, firstLauch : boolean) : string[] {
    let uuid = getUuid();
    let uname = getUname();
    let ip = getIpV4();
    let vipFlg = isVip();
    let expireTime = getExpireTime();
    let buyTimes = getBuyTimes();
    let html = resolveHtmlPath('index.html');
    let appVersion = packageJson.version;
    let appName = packageJson.name;

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
        "$$" + base64Encode("firstLauch=" + firstLauch),
    ];
}