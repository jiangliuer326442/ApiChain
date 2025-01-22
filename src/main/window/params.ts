import fse from 'fs-extra';
import { dialog } from 'electron';
import log from 'electron-log';
import { setLang } from '../../lang/i18n';
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

    if (!uuidExists()) {
        dialog.showErrorBox("未找到 id_rsa.pub 文件", "请通过 ssh-keygen -t RSA 命令生成该文件，用于标记您在团队内的身份");
        process.exit(1);
    }

    let firstLauch = isFirstLauch();
    if (firstLauch) {
        giftVip(3);
    }

    let result = doGetInitParams(packageJson, lang, firstLauch);
    log.info("getInitParams finished, cost time: " + (Date.now() - _btime));
    return result;
}

function doGetInitParams(packageJson : any, lang : string, firstLauch : boolean) : string[] {
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

    setLang(userCountry, userLang);

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