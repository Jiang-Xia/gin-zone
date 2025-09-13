package utils

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"

	"github.com/tjfoc/gmsm/sm2"
	"github.com/tjfoc/gmsm/sm3"
	"github.com/tjfoc/gmsm/sm4"
)

// SM2 加密
func SM2Encrypt(publicKey *sm2.PublicKey, plaintext []byte) (string, error) {
	ciphertext, err := publicKey.EncryptAsn1(plaintext, rand.Reader)
	if err != nil {
		return "", fmt.Errorf("SM2 加密失败 : %v", err)
	}
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// SM2 解密
func SM2Decrypt(privateKey *sm2.PrivateKey, ciphertext string) ([]byte, error) {
	cipherBytes, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return nil, fmt.Errorf("base64 decode failed: %v", err)
	}
	plaintext, err := privateKey.DecryptAsn1(cipherBytes)
	if err != nil {
		return nil, fmt.Errorf("SM2 解密失败: %v", err)
	}
	return plaintext, nil
}

// SM4 加密 (CBC 模式示例)
func SM4Encrypt(key []byte, plaintext []byte) (string, error) {
	if len(key) != 16 {
		return "", errors.New("SM4 秘钥必需为16位")
	}
	cipher, err := sm4.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("SM4 加密失败: %v", err)
	}
	// 需要处理填充和IV，这里简化示例
	ciphertext := make([]byte, len(plaintext))
	cipher.Encrypt(ciphertext, plaintext)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// SM4 解密
func SM4Decrypt(key []byte, ciphertext string) ([]byte, error) {
	if len(key) != 16 {
		return nil, errors.New("SM4 key must be 16 bytes")
	}
	cipherBytes, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return nil, fmt.Errorf("base64 decode failed: %v", err)
	}
	cipher, err := sm4.NewCipher(key)
	if err != nil {
		return nil, fmt.Errorf("SM4 cipher creation failed: %v", err)
	}
	plaintext := make([]byte, len(cipherBytes))
	cipher.Decrypt(plaintext, cipherBytes)
	return plaintext, nil
}

// SM3 生成哈希
func SM3Hash(data []byte) string {
	h := sm3.New()
	h.Write(data)
	return fmt.Sprintf("%x", h.Sum(nil))
}
