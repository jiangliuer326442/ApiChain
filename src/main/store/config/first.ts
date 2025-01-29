import getCache from './index';

export const TABLE_NAME = "user.init";

//会员过期时间
const FIRST_LAUCH = TABLE_NAME + ".lauch";

export function isFirstLauch() {
    let cache = getCache("");
    if (!cache.get(FIRST_LAUCH)) {
        cache.set(FIRST_LAUCH, true);
        return true;
    }
    return false;
}