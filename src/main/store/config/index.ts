import Store from 'electron-store';
import { getSalt } from './user';


export default function(key:string) : Store {
    let salt = "";
    if (key === '') {
        salt = getSalt();
    } else {
        salt = key;
    }
    const store = new Store({encryptionKey : salt});
    return store;
}