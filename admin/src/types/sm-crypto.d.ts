declare module 'sm-crypto' {
  export const sm2: {
    doDecrypt(cipherText: string, privateKey: string, cipherMode?: number): string;
  };

  export const sm4: {
    encrypt(plainText: string, key: string): string;
    decrypt(cipherText: string, key: string): string;
  };
}
