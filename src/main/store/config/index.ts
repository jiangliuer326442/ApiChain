import Store from 'electron-store'
import { getSalt } from '../../processInit/uuid';

export default function(encryptionKey:string) : Store {
    if (encryptionKey === '') {
        encryptionKey = getSalt();
    }
    const store = new Store({encryptionKey});
    return store;
}