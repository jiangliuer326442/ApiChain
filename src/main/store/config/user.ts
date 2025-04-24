import { app } from 'electron';
import path from 'path';
import fse from 'fs-extra';

import { md5, readPublicKey } from '../../util/util';

let cache_uid = "";
let cache_salt = "";
let cache_uname = "";

let privateKeyPath = path.join(app.getPath("home"), '.ssh', 'id_rsa');

let privateKeyContent = "";

export function getUuid() : string {
    if (cache_uid === "") {
        let publicKey = readPublicKey();
        publicKey = publicKey.split(" ")[1];
        publicKey = md5(publicKey).substring(0, 8);
        cache_uid = publicKey;
    }

    return cache_uid;
}

export function getUname() : string {
    if (cache_uname === "") {
        let publicKey = readPublicKey();
        publicKey = publicKey.split(" ")[2].replace(/\r?\n/g, '');
        cache_uname = publicKey;
    }

    return cache_uname;
}

export function getSalt() : string {
    if (cache_salt === "") {
        let privateKey = readPrivateKey();
        privateKey = privateKey.replace("-----BEGIN RSA PRIVATE KEY-----", "");
        privateKey = privateKey.replace("-----END RSA PRIVATE KEY-----", "");
        privateKey = privateKey.replace(/\s/g, '');
        privateKey = privateKey.replace(/\r?\n/g, '');
        privateKey = md5(privateKey).substring(0, 16);
        cache_salt = privateKey;
    }

    return cache_salt;
}

function readPrivateKey() {
    if (privateKeyContent === "") {
        let salt = (fse.readFileSync(privateKeyPath)).toString();
        privateKeyContent = salt;
    }

    return privateKeyContent;
}