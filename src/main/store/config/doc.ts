import Store from 'electron-store';

export const TABLE_NAME = "vip.doc.access";

export function setAccess(id:string, access:boolean, store : Store) {
    store.set(TABLE_NAME + "." + id, access);
}

export function getAccess(id:string, store : Store) : boolean {
    let result = store.get(TABLE_NAME + "." + id);
    if (result === null || result === "" || result === undefined) {
        result = false;
    }
    return result as boolean;
}