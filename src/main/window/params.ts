import { app } from 'electron';
import Store from 'electron-store';
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import { setLang } from '../../lang/i18n';
import { getUname } from '../store/config/user';
import { isFirstLauch } from '../store/config/first';
import { 
    isVip, 
    isShowCkcode, 
    getExpireTime, 
    getBuyTimes, 
    giftVip 
} from '../store/config/vip';
import { getClientType, getClientHost, getTeamId } from '../store/config/team'
import { pingHost, postRequest } from '../util/teamUtil';
import { md5 } from '../util/util';
import { urlEncode } from '../../renderer/util';
import { TEAM_QUERY_NAME, CLIENT_TYPE_SINGLE } from '../../config/team';
import { osLocale } from '../third_party/os-locale';
import { 
    getIpV4,
    getPackageJson,
    base64Encode,
} from '../util/util';
import { isStringEmpty } from '../../renderer/util';

export function systemInit() {
    // 定义初始化文件路径
    let basePath = app.getPath('userData')
    const installFilePath = path.join(basePath, '.lock');
    const pubKeyPath = path.join(basePath, '.pub');
    const priKeyPath = path.join(basePath, '.rsa');
    let exportPrivateKey = "";
    let exportPublicKey = "";
    if (!fs.existsSync(installFilePath)) {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
            },
            privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: 'BE1BDEC0AA74B4DCB079943E70528096CCA985F8'
            }
        });
        exportPublicKey = publicKey;
        exportPrivateKey = privateKey;

        fs.ensureDirSync(basePath);
        fs.writeFileSync(pubKeyPath, exportPublicKey);
        fs.writeFileSync(priKeyPath, exportPrivateKey);
        fs.writeFileSync(installFilePath, '');
    } else {
        exportPublicKey = fs.readFileSync(pubKeyPath).toString();
        exportPrivateKey = fs.readFileSync(priKeyPath).toString();
    }
    let store = new Store({encryptionKey : exportPrivateKey});
    return { exportPrivateKey, exportPublicKey, store };
}

export async function getInitParams(privateKey : string, publicKey : string, store : Store) : Promise<string[]> {
    let packageJson = await getPackageJson();
    let lang = await osLocale();
    // if (process.env.NODE_ENV === 'development') {
    //     lang = 'en-AU';
    // }
    let userLang = lang.split("-")[0];
    let userCountry = lang.split("-")[1];
    setLang(userCountry, userLang);

    let teamServerErrorMessage = await pingHost(privateKey, null, store);
    let teamName = "";
    if (isStringEmpty(teamServerErrorMessage)) {
        let ret = await postRequest(privateKey, TEAM_QUERY_NAME, {}, store)
        teamName = urlEncode(ret[1]);
    }

    let showCkCodeRet = await isShowCkcode(store);

    let firstLauch = isFirstLauch(store);
    if (firstLauch) {
        giftVip(3, store);
    }

    let uid = md5(privateKey);

    return doGetInitParams(uid, packageJson, showCkCodeRet, userLang, userCountry, teamName, firstLauch, store);
}

function doGetInitParams(uid : string, packageJson : any, showCkCodeRet : any, userLang : string, userCountry : string, teamName : string, firstLauch : boolean, store : Store) : string[] {
    let uname = getUname();
    let ip = getIpV4();
    let vipFlg = isVip(store);
    let expireTime = getExpireTime(store);
    let buyTimes = getBuyTimes(store);
    let appVersion = packageJson.version;
    let appName = packageJson.name;
    let defaultRunnerUrl = packageJson.defaultRunnerUrl;
    let minServerVersion = packageJson.minServerVersion;
    let allowedChains = packageJson.allowedChains;
    let clientType = getClientType(store);
    let clientHost = getClientHost(store);
    let teamId = getTeamId(store);
    if (isStringEmpty(teamName)) {
        clientType = CLIENT_TYPE_SINGLE;
    }

    return [
        "$$" + base64Encode("uuid=" + uid),
        "$$" + base64Encode("uname=" + uname),
        "$$" + base64Encode("ip=" + ip),
        "$$" + base64Encode("vipFlg=" + vipFlg),
        "$$" + base64Encode("showCkCode=" + showCkCodeRet[0]),
        "$$" + base64Encode("ckCodeType=" + showCkCodeRet[1]),
        "$$" + base64Encode("payMethod=" + showCkCodeRet[2]),
        "$$" + base64Encode("expireTime=" + expireTime),
        "$$" + base64Encode("buyTimes=" + buyTimes),
        "$$" + base64Encode("appVersion=" + appVersion),
        "$$" + base64Encode("appName=" + appName),
        "$$" + base64Encode("defaultRunnerUrl=" + defaultRunnerUrl),
        "$$" + base64Encode("minServerVersion=" + minServerVersion),
        "$$" + base64Encode("allowedChains=" + allowedChains),
        "$$" + base64Encode("userLang=" + userLang),
        "$$" + base64Encode("userCountry=" + userCountry),
        "$$" + base64Encode("firstLauch=" + firstLauch),
        "$$" + base64Encode("clientType=" + clientType),
        "$$" + base64Encode("teamName=" + teamName),
        "$$" + base64Encode("clientHost=" + clientHost),
        "$$" + base64Encode("teamId=" + teamId),
    ];
}