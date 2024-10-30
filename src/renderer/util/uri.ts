import { isStringEmpty } from './';

export function getHostRight (host : string) : string {
    if (host.indexOf("http://") === 0 || host.indexOf("https://") === 0) {
        let returnStr = "";
        let arr = host.split("/");
        for (let i = 0; i < arr.length; i++) {
            if (i >= 3) {
                if(!isStringEmpty(arr[i])) {
                    returnStr += arr[i] + "/";
                }
            }
        }
        returnStr = returnStr.substring(0, returnStr.length - 1);
        return returnStr;
    } else if (host.indexOf("{{") === 0) {
        let rightIndex = host.indexOf("}}");
        let returnStr = host.substring(rightIndex + 2);
        if (returnStr.indexOf("/") === 0) {
            returnStr = returnStr.substring(1);
        }
        return returnStr;
    }
    return host;
}