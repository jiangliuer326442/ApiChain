const { machineIdSync } = require('node-machine-id');
const { sm2 } = require('sm-crypto');
const crypto = require('crypto');

// SM2加密
function encrypt(publicKey, plaintext) {
  return sm2.doEncrypt(plaintext, publicKey, 1);
}

// SM2解密
function decrypt(privateKey, ciphertext) {
  return sm2.doDecrypt(ciphertext, privateKey, 1, { 
    hash: true,
    der: false  
 });
}

// SM2签名
function sign(privateKey, plaintext) {
    return sm2.doSignature(plaintext, privateKey);
}

// SM2验签
function verify(publicKey, plaintext, signature) {
  return sm2.doVerifySignature(plaintext, signature, publicKey);
}

// 生成 SM2 密钥对
const privateKey = machineIdSync(true).replaceAll("-", "");
console.log(`privateKey:${privateKey}`);
const publicKey = sm2.getPublicKeyFromPrivateKey(privateKey);
console.log(`publicKey:${publicKey}`);

const encryptData = "mCR9O2IGyaG844Taj0GYaB18Xdq8QSD53aA+/b6KTrWb9VgbWK/csj/w/gnH6UfPYhnRnz/R4rYRrvS/IlnDDBzxlY1OVtw2yYO35l1Izgw=";
const key = crypto.createHash('md5').update(publicKey).digest('hex').substring(0, 16);
const decipher = crypto.createDecipheriv('aes-128-ecb', Buffer.from(key), null);
let decrypted = decipher.update(encryptData, 'base64', 'utf8');
decrypted += decipher.final('utf8');
console.log(`Decrypted Data: ${decrypted}`);