import { app } from 'electron';
import Store from 'electron-store';
import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import { setLangWraped } from '../processInit/langguage';
import { 
    setLang,
    getLang,
} from '../../lang/i18n';
import { getUname } from '../store/config/user';
import { isFirstLauch } from '../store/config/first';
import { 
    isVip, 
    isShowCkcode, 
    getExpireTime, 
    getBuyTimes, 
    giftVip 
} from '../store/config/vip';
import { getClientHost, setClientInfo } from '../store/config/team'
import { pingHost, postRequest } from '../util/teamUtil';
import { 
    md5, 
    getDefaultRunner,
    getIpV4,
    getPackageJson,
    base64Encode,
    logInfo,
} from '../util/util';
import { urlEncode } from '../../renderer/util';
import { TEAM_QUERY_NAME, CLIENT_TYPE_SINGLE, CLIENT_TYPE_TEAM } from '../../config/team';
import { osLocaleSync } from '../third_party/os-locale';
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

export async function getInitParams(privateKey : string, startupParams : object, store : Store) : Promise<string[]> {
    let packageJson = await getPackageJson();
    const [_, userCountry] = osLocaleSync().split("-");

    let teamServerErrorMessage = await pingHost(privateKey, null, store);
    let teamName = "";
    let teamId = "";
    let clientType = CLIENT_TYPE_SINGLE;
    let isAdmin = false;
    let isSuperAdmin = false;
    let isAiSupport = false;
    if (isStringEmpty(teamServerErrorMessage)) {
        let ret = await postRequest(privateKey, TEAM_QUERY_NAME, {}, store);
        if (isStringEmpty(ret[1].teamId)) {
            setClientInfo(CLIENT_TYPE_SINGLE, null, store)
        } else {
            teamId = ret[1].teamId;
            teamName = urlEncode(ret[1].teamName);
            setClientInfo(CLIENT_TYPE_TEAM, teamId, store);
            clientType = CLIENT_TYPE_TEAM;
            isAdmin = ret[1].isAdmin;
            isSuperAdmin = ret[1].isSuperAdmin;
            isAiSupport = ret[1].isAiSupport;
        }
    }

    let clientHost = getClientHost(store);

    let showCkCodeRet = await isShowCkcode(store);

    let firstLauch = isFirstLauch(store);
    if (firstLauch) {
        giftVip(3, store);
    }

    let uid = md5(privateKey);

    let preferLang = setLangWraped(store);

    let defaultRunner = getDefaultRunner();

    return doGetInitParams(uid, packageJson, defaultRunner, showCkCodeRet, 
        preferLang, userCountry, teamName, firstLauch, 
        teamId, clientHost, clientType, isSuperAdmin, isAdmin, isAiSupport,
        startupParams, store);
}

function doGetInitParams(
    uid : string, packageJson : any, 
    defaultRunner : string,
    showCkCodeRet : any, preferLang : string, userCountry : string, teamName : string, 
    firstLauch : boolean, 
    teamId : string, clientHost : string, clientType : string, isSuperAdmin : boolean, isAdmin : boolean, isAiSupport : boolean,
    startupParams : object, store : Store) : string[] {
    let uname = getUname();
    let ip = getIpV4();
    let vipFlg = isVip(store);
    let expireTime = getExpireTime(store);
    let buyTimes = getBuyTimes(store);
    let appVersion = packageJson.version;
    let appName = packageJson.name;
    let minServerVersion = packageJson.minServerVersion;

    let response = [
        "uuid=" + uid,
        "uname=" + uname,
        "ip=" + ip,
        "vipFlg=" + vipFlg,
        "showCkCode=" + showCkCodeRet[0],
        "ckCodeType=" + showCkCodeRet[1],
        "payMethod=" + showCkCodeRet[2],
        "expireTime=" + expireTime,
        "buyTimes=" + buyTimes,
        "appVersion=" + appVersion,
        "appName=" + appName,
        "defaultRunnerUrl=" + defaultRunner,
        "minServerVersion=" + minServerVersion,
        "preferLang=" + preferLang,
        "userCountry=" + userCountry,
        "firstLauch=" + firstLauch,
        "clientType=" + clientType,
        "teamName=" + teamName,
        "clientHost=" + clientHost,
        "teamId=" + teamId,
        "isSuperAdmin=" + (isSuperAdmin ? "1" : "0"),
        "isAdmin=" + (isAdmin ? "1" : "0"),
        "isAiSupport=" + (isAiSupport ? "1" : "0"),
        "isUnitTest=" + ((process.env.NODE_ENV !== 'production' || process.env.CHAT_PROVIDER === "ZHAOHANG") ? "1" : "0")
    ]

    for (let startupKey in startupParams) {
        if (startupParams.hasOwnProperty(startupKey)) {
            response.push(startupKey + "=" + startupParams[startupKey]);
        }
    }

    logInfo('restart params:', response);

    const base64Response = response.map(row => `$$${base64Encode(row)}`);

    return base64Response;
}