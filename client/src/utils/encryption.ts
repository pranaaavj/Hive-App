// src/utils/encryption.ts
import CryptoJS from 'crypto-js';
const SECRET_KEY = import.meta.env.VITE_REDUX_SECRET!; // Secret key for encryption

// Encrypt state
export const encryptState = (state: any) => {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(state), SECRET_KEY).toString();
  return encrypted;
};

// Decrypt state
export const decryptState = (encryptedState: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedState, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted ? JSON.parse(decrypted) : undefined;
};
