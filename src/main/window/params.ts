import { dialog } from 'electron';
import log from 'electron-log';
import { langTrans, setLang } from '../../lang/i18n';
import { getUuid, getUname } from '../store/config/user';
import { isFirstLauch } from '../store/config/first';
import { 
    isVip, 
    isShowCkcode, 
    getCheckCodeUrl, 
    getExpireTime, 
    getBuyTimes, 
    giftVip 
} from '../store/config/vip';
import { getClientType, getClientHost, getTeamId } from '../store/config/team'
import { pingHost, postRequest } from '../util/teamUtil';
import { urlEncode } from '../../renderer/util';
import { TEAM_QUERY_NAME, CLIENT_TYPE_SINGLE } from '../../config/team';
import { getDemoDatabaseFile, getDemoPostmanFile } from '../../config/url';
import { osLocale } from '../third_party/os-locale';
import { 
    getIpV4,
    getPackageJson,
    base64Encode,
    uuidExists,
} from '../util/util';
import { isStringEmpty } from '../../renderer/util';

export async function getInitParams() : Promise<string[]> {
    let _btime = Date.now();
    let packageJson = await getPackageJson();
    let lang = await osLocale();
    if (process.env.NODE_ENV === 'development') {
        lang = 'en-AU';
    }
    let userLang = lang.split("-")[0];
    let userCountry = lang.split("-")[1];
    setLang(userCountry, userLang);

    let teamServerErrorMessage = await pingHost(null);
    let teamName = "";
    if (isStringEmpty(teamServerErrorMessage)) {
        let ret = await postRequest(TEAM_QUERY_NAME, {})
        teamName = urlEncode(ret[1]);
    }

    if (!uuidExists()) {
        dialog.showErrorBox(langTrans("lack sshkey title"), langTrans("lack sshkey content"));
        process.exit(1);
    }

    let firstLauch = isFirstLauch();
    if (firstLauch) {
        giftVip(3);
    }

    let result = await doGetInitParams(packageJson, userLang, userCountry, teamName, firstLauch);
    log.info("getInitParams finished, cost time: " + (Date.now() - _btime));
    return result;
}

async function doGetInitParams(packageJson : any, userLang : string, userCountry : string, teamName : string, firstLauch : boolean) : string[] {
    let uuid = getUuid();
    let uname = getUname();
    let ip = getIpV4();
    let vipFlg = isVip();
    let showCkCode = isShowCkcode();
    let ckCodeUrl = "";
    let expireTime = getExpireTime();
    let buyTimes = getBuyTimes();
    let appVersion = packageJson.version;
    let appName = packageJson.name;
    let defaultRunnerUrl = packageJson.defaultRunnerUrl;
    let demoDatabaseFile = getDemoDatabaseFile(packageJson.staticUrl);
    let demoPostmanFile = getDemoPostmanFile(packageJson.staticUrl);
    let minServerVersion = packageJson.minServerVersion;
    let aiModels = packageJson.aiModels;
    let clientType = getClientType();
    let clientHost = getClientHost();
    let teamId = getTeamId();
    if (isStringEmpty(teamName)) {
        clientType = CLIENT_TYPE_SINGLE;
    }
    if (showCkCode) {
        ckCodeUrl = await getCheckCodeUrl();
    }

    return [
        "$$" + base64Encode("uuid=" + uuid),
        "$$" + base64Encode("uname=" + uname),
        "$$" + base64Encode("ip=" + ip),
        "$$" + base64Encode("vipFlg=" + vipFlg),
        "$$" + base64Encode("showCkCode=" + showCkCode),
        "$$" + base64Encode("ckCodeUrl=" + ckCodeUrl),
        "$$" + base64Encode("expireTime=" + expireTime),
        "$$" + base64Encode("buyTimes=" + buyTimes),
        "$$" + base64Encode("appVersion=" + appVersion),
        "$$" + base64Encode("appName=" + appName),
        "$$" + base64Encode("defaultRunnerUrl=" + defaultRunnerUrl),
        "$$" + base64Encode("demoDatabaseFile=" + demoDatabaseFile),
        "$$" + base64Encode("demoPostmanFile=" + demoPostmanFile),
        "$$" + base64Encode("minServerVersion=" + minServerVersion),
        "$$" + base64Encode("aiModels=" + aiModels),
        "$$" + base64Encode("userLang=" + userLang),
        "$$" + base64Encode("userCountry=" + userCountry),
        "$$" + base64Encode("firstLauch=" + firstLauch),
        "$$" + base64Encode("clientType=" + clientType),
        "$$" + base64Encode("teamName=" + teamName),
        "$$" + base64Encode("clientHost=" + clientHost),
        "$$" + base64Encode("teamId=" + teamId),
    ];
}