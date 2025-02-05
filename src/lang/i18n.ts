import zhTwLang from './locales/zh-TW.json';
import zhCnLang from './locales/zh-CN.json';
import enUsLang from './locales/en-US.json';

let data : any = {};

let lang = "en-US";

export function setLang(userCountry : string, userLang : string) {
  if (userLang === 'zh') {
    if (userCountry === 'CN') {
      lang = "zh-CN";
    } else {
      lang = "zh-TW"
    }
  }

  if (lang == 'zh-CN') {
    data = zhCnLang;
  } else if (lang == 'zh-TW') {
    data = zhTwLang;
  } else if (lang == 'en-US') {
    data = enUsLang;
  } else {
    data = enUsLang;
  }
}

export function getLang() : string {
  return lang;
}

export function langTrans(key : string) {
  if (key === "nav request") {
    console.log("langTrans", data);
  }
  if (key in data) {
    return data[key];
  } else {
    return "";
  }
}

export function langFormat(key : string, format : any) {
  if (key in data) {
    let content = data[key];
    for (let _key in format) {
      content = content.replace(`{{${_key}}}`, format[_key]);
    }
    return content;
  } else {
    return "";
  }
}