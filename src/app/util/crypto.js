//npm i crypto-js
import {CryptoJS} from '../NodeModule.js';

// console.log('CryptoJS', CryptoJS);

//加密方法
function encrypt(word) {
    const keyStr = "08b68b91bb54ed41";
    const key = CryptoJS.enc.Utf8.parse(keyStr);
    const iv = CryptoJS.enc.Utf8.parse(keyStr); 
    
    let srcs = CryptoJS.enc.Utf8.parse(word);
    
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { 
        mode: CryptoJS.mode.CBC, 
        iv: iv,
        padding: CryptoJS.pad.Pkcs7 
    });
    
    let encryptedHexStr = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    return encryptedHexStr;
}

export default {
    encrypt
}