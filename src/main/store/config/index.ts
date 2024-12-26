import { app } from 'electron';
import Store from 'electron-store';
import path from 'path';
import { getSalt } from './user';
import { TABLE_NAME as doc_key } from './doc';
import { TABLE_NAME as mock_server_key } from './mockserver';
import { TABLE_NAME as vip_key } from './vip';
import { base64Decode } from '../../util/util'
import fse from 'fs-extra';


export default function(key:string) : Store {
    let salt = "";
    if (key === '') {
        salt = getSalt();
    } else {
        salt = key;
    }
    try {
        const store = new Store({encryptionKey : salt});
        return store;
    } catch (error) {
        let tempSalt = base64Decode((fse.readFileSync(path.join(app.getPath('userData'), 'uuid'))).toString()).split(":")[1];
        let tempStore = new Store({encryptionKey : tempSalt});
        let insertContent : any = {};
        const docValue = tempStore.get(doc_key);
        if (docValue !== null && docValue !== undefined && Object.keys(docValue).length > 0) {
            insertContent[doc_key] = docValue;
        }
        const vipValue = tempStore.get(vip_key);
        if (vipValue !== null && vipValue !== undefined && Object.keys(vipValue).length > 0) {
            insertContent[vip_key] = vipValue;
        }
        const mockServerValue = tempStore.get(mock_server_key);
        if (mockServerValue !== null && mockServerValue !== undefined && Object.keys(mockServerValue).length > 0) {
            insertContent[mock_server_key] = mockServerValue;
        }
        fse.removeSync(path.join(app.getPath('userData'), 'config.json'));
        fse.removeSync(path.join(app.getPath('userData'), 'uuid'));
        const store = new Store({encryptionKey : salt});
        if (Object.keys(insertContent).length > 0) {
            for (let _key in insertContent) {
                store.set(_key, insertContent[_key]);
            }
        }
        return store;
    }
}