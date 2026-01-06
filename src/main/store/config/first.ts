import Store from 'electron-store';

export const TABLE_NAME = "user.init";

//会员过期时间
const FIRST_LAUCH = TABLE_NAME + ".lauch";

export function isFirstLauch(store : Store) {
    if (!store.get(FIRST_LAUCH)) {
        store.set(FIRST_LAUCH, true);
        return true;
    }
    return false;
}