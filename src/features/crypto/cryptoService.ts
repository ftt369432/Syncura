/**
 * Zero-Knowledge Envelope Encryption Engine (ZK-EE)
 * Uses Web Crypto API for hardware-accelerated AES-256-GCM encryption
 * and PBKDF2 key derivation for master key generation.
 */

export interface EncryptedPayload {
  version: 'v1';
  iv: string; // Hex string (12 bytes)
  ciphertext: string; // Base64 string
  tagLength?: number;
}

export class CryptoService {
  /**
   * Generates a 256-bit symmetric Data Encryption Key (DEK) for a profile
   */
  static async generateDEK(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Derives a Key Encryption Key (KEK) from a user's master passphrase + salt
   */
  static async deriveKEK(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['wrapKey', 'unwrapKey', 'encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts plaintext string using AES-256-GCM with a random 12-byte IV
   */
  static async encrypt(plaintext: string, key: CryptoKey): Promise<string> {
    const enc = new TextEncoder();
    const encoded = enc.encode(plaintext);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoded
    );

    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const cipherBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

    return `v1:${ivHex}:${cipherBase64}`;
  }

  /**
   * Decrypts an encrypted payload formatted as `v1:ivHex:cipherBase64`
   */
  static async decrypt(encryptedString: string, key: CryptoKey): Promise<string> {
    if (!encryptedString.startsWith('v1:')) {
      throw new Error('Unsupported encryption format');
    }

    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      throw new Error('Malformed encrypted payload');
    }

    const ivHex = parts[1];
    const cipherBase64 = parts[2];

    const iv = new Uint8Array(
      ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    const binaryString = atob(cipherBase64);
    const ciphertext = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      ciphertext[i] = binaryString.charCodeAt(i);
    }

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  }

  /**
   * Exports a CryptoKey to raw hex or base64 format for secure local enclave storage
   */
  static async exportKeyRaw(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  /**
   * Imports a raw base64 key back into a CryptoKey object
   */
  static async importKeyRaw(base64Key: string): Promise<CryptoKey> {
    const binaryString = atob(base64Key);
    const keyData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      keyData[i] = binaryString.charCodeAt(i);
    }

    return await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }
}
