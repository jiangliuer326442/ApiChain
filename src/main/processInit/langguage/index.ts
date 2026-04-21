import Store from 'electron-store';
import { app, ipcMain } from 'electron';

import { osLocaleSync } from '../../third_party/os-locale';
import { 
    ChannelsLangStr,
    ChannelsLangSet,
} from '../../../config/channel';
import {
    PREFFER_LANGUAGE
} from '../../../config/storage';
import { setLang, getLang, setLang2 } from '../../../lang/i18n'
import { isStringEmpty } from '../../../renderer/util';

export function setLangWraped(store : Store) {
    let newLang = store.get(PREFFER_LANGUAGE) as string;
    if (isStringEmpty(newLang)) {
        const lang = osLocaleSync();
        let userLang = lang.split("-")[0];
        let userCountry = lang.split("-")[1];
        setLang(userCountry, userLang);
    } else {
        setLang2(newLang);
    }
    return getLang();
}

export default function (store : Store){
    ipcMain.on(ChannelsLangStr, async (event, action, newLang) => {
        if (action !== ChannelsLangSet) return;

        store.set(PREFFER_LANGUAGE, newLang);

        app.relaunch();
        app.exit(0);
    })
}