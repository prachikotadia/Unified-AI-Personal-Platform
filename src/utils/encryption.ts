// CryptoJS for encryption/decryption
import CryptoJS from 'crypto-js';
import { useCallback } from 'react';

// Encryption configuration
interface EncryptionConfig {
  algorithm: 'AES' | 'DES' | 'TripleDES';
  mode: 'CBC' | 'ECB' | 'CFB' | 'OFB';
  padding: 'Pkcs7' | 'Iso97971' | 'AnsiX923' | 'Iso10126' | 'ZeroPadding' | 'NoPadding';
  keySize: 128 | 192 | 256;
}

// Default encryption configuration
const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'AES',
  mode: 'CBC',
  padding: 'Pkcs7',
  keySize: 256
};

// Encryption class
class DataEncryption {
  private config: EncryptionConfig;
  private masterKey: string;

  constructor(config: EncryptionConfig = DEFAULT_CONFIG, masterKey?: string) {
    this.config = config;
    this.masterKey = masterKey || this.generateMasterKey();
  }

  // Generate a secure master key
  private generateMasterKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Generate a random IV (Initialization Vector)
  private generateIV(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Encrypt data
  public encrypt(data: string, key?: string): string {
    try {
      const encryptionKey = key || this.masterKey;
      const iv = this.generateIV();
      
      // Convert key and IV to WordArray
      const keyWordArray = CryptoJS.enc.Hex.parse(encryptionKey);
      const ivWordArray = CryptoJS.enc.Hex.parse(iv);
      
      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(data, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Combine IV and encrypted data
      const result = iv + encrypted.toString();
      return result;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data
  public decrypt(encryptedData: string, key?: string): string {
    try {
      const encryptionKey = key || this.masterKey;
      
      // Extract IV and encrypted data
      const iv = encryptedData.substring(0, 32);
      const encrypted = encryptedData.substring(32);
      
      // Convert key and IV to WordArray
      const keyWordArray = CryptoJS.enc.Hex.parse(encryptionKey);
      const ivWordArray = CryptoJS.enc.Hex.parse(iv);
      
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encrypted, keyWordArray, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Encrypt object
  public encryptObject(obj: any, key?: string): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString, key);
  }

  // Decrypt object
  public decryptObject(encryptedData: string, key?: string): any {
    const decryptedString = this.decrypt(encryptedData, key);
    return JSON.parse(decryptedString);
  }

  // Hash data (one-way encryption)
  public hash(data: string, algorithm: 'SHA256' | 'SHA512' | 'MD5' = 'SHA256'): string {
    switch (algorithm) {
      case 'SHA256':
        return CryptoJS.SHA256(data).toString();
      case 'SHA512':
        return CryptoJS.SHA512(data).toString();
      case 'MD5':
        return CryptoJS.MD5(data).toString();
      default:
        return CryptoJS.SHA256(data).toString();
    }
  }

  // Generate secure password hash with salt
  public hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const generatedSalt = salt || this.generateSalt();
    const saltedPassword = password + generatedSalt;
    const hash = this.hash(saltedPassword, 'SHA256');
    
    return { hash, salt: generatedSalt };
  }

  // Verify password
  public verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    return computedHash === hash;
  }

  // Generate salt
  private generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Encrypt sensitive fields in an object
  public encryptSensitiveFields(obj: any, fields: string[], key?: string): any {
    const encrypted = { ...obj };
    
    fields.forEach(field => {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = this.encrypt(encrypted[field], key);
      }
    });
    
    return encrypted;
  }

  // Decrypt sensitive fields in an object
  public decryptSensitiveFields(obj: any, fields: string[], key?: string): any {
    const decrypted = { ...obj };
    
    fields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = this.decrypt(decrypted[field], key);
        } catch (error) {
          console.warn(`Failed to decrypt field ${field}:`, error);
        }
      }
    });
    
    return decrypted;
  }
}

// Create global encryption instance
export const encryption = new DataEncryption();

// Sensitive data fields that should be encrypted
export const SENSITIVE_FIELDS = {
  USER: ['password', 'ssn', 'creditCardNumber', 'bankAccountNumber', 'passportNumber'],
  PAYMENT: ['cardNumber', 'cvv', 'accountNumber', 'routingNumber'],
  PERSONAL: ['phoneNumber', 'email', 'address', 'dateOfBirth'],
  BUSINESS: ['taxId', 'ein', 'licenseNumber', 'contractDetails']
};

// Encryption utilities for specific use cases
export const encryptionUtils = {
  // Encrypt user data
  encryptUserData: (userData: any): any => {
    return encryption.encryptSensitiveFields(userData, SENSITIVE_FIELDS.USER);
  },

  // Decrypt user data
  decryptUserData: (userData: any): any => {
    return encryption.decryptSensitiveFields(userData, SENSITIVE_FIELDS.USER);
  },

  // Encrypt payment data
  encryptPaymentData: (paymentData: any): any => {
    return encryption.encryptSensitiveFields(paymentData, SENSITIVE_FIELDS.PAYMENT);
  },

  // Decrypt payment data
  decryptPaymentData: (paymentData: any): any => {
    return encryption.decryptSensitiveFields(paymentData, SENSITIVE_FIELDS.PAYMENT);
  },

  // Encrypt personal data
  encryptPersonalData: (personalData: any): any => {
    return encryption.encryptSensitiveFields(personalData, SENSITIVE_FIELDS.PERSONAL);
  },

  // Decrypt personal data
  decryptPersonalData: (personalData: any): any => {
    return encryption.decryptSensitiveFields(personalData, SENSITIVE_FIELDS.PERSONAL);
  },

  // Hash password for storage
  hashPasswordForStorage: (password: string): { hash: string; salt: string } => {
    return encryption.hashPassword(password);
  },

  // Verify stored password
  verifyStoredPassword: (password: string, storedHash: string, storedSalt: string): boolean => {
    return encryption.verifyPassword(password, storedHash, storedSalt);
  }
};

// Secure storage utilities
export const secureStorage = {
  // Store encrypted data in localStorage
  setItem: (key: string, value: any, encrypt: boolean = true): void => {
    try {
      const dataToStore = encrypt ? encryption.encryptObject(value) : JSON.stringify(value);
      localStorage.setItem(key, dataToStore);
    } catch (error) {
      console.error('Failed to store data securely:', error);
      throw new Error('Failed to store data');
    }
  },

  // Retrieve encrypted data from localStorage
  getItem: (key: string, decrypt: boolean = true): any => {
    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) return null;
      
      return decrypt ? encryption.decryptObject(storedData) : JSON.parse(storedData);
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },

  // Remove item from secure storage
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  // Clear all secure storage
  clear: (): void => {
    localStorage.clear();
  }
};

// API encryption middleware
export const apiEncryption = {
  // Encrypt request data
  encryptRequest: (data: any, sensitiveFields: string[] = []): any => {
    if (sensitiveFields.length > 0) {
      return encryption.encryptSensitiveFields(data, sensitiveFields);
    }
    return data;
  },

  // Decrypt response data
  decryptResponse: (data: any, sensitiveFields: string[] = []): any => {
    if (sensitiveFields.length > 0) {
      return encryption.decryptSensitiveFields(data, sensitiveFields);
    }
    return data;
  },

  // Encrypt API payload
  encryptPayload: (payload: any): string => {
    return encryption.encryptObject(payload);
  },

  // Decrypt API payload
  decryptPayload: (encryptedPayload: string): any => {
    return encryption.decryptObject(encryptedPayload);
  }
};

// File encryption utilities
export const fileEncryption = {
  // Encrypt file content
  encryptFile: async (file: File): Promise<{ encryptedContent: string; originalName: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const encryptedContent = encryption.encrypt(content);
          resolve({
            encryptedContent: encryptedContent,
            originalName: file.name
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  // Decrypt file content
  decryptFile: (encryptedContent: string): string => {
    return encryption.decrypt(encryptedContent);
  },

  // Create encrypted file download
  createEncryptedDownload: (content: string, filename: string): void => {
    const encryptedContent = encryption.encrypt(content);
    const blob = new Blob([encryptedContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.encrypted`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Encryption hook for React components
export const useEncryption = () => {
  const encrypt = useCallback((data: string) => {
    return encryption.encrypt(data);
  }, []);

  const decrypt = useCallback((encryptedData: string) => {
    return encryption.decrypt(encryptedData);
  }, []);

  const encryptObject = useCallback((obj: any) => {
    return encryption.encryptObject(obj);
  }, []);

  const decryptObject = useCallback((encryptedData: string) => {
    return encryption.decryptObject(encryptedData);
  }, []);

  const hashPassword = useCallback((password: string) => {
    return encryption.hashPassword(password);
  }, []);

  const verifyPassword = useCallback((password: string, hash: string, salt: string) => {
    return encryption.verifyPassword(password, hash, salt);
  }, []);

  return {
    encrypt,
    decrypt,
    encryptObject,
    decryptObject,
    hashPassword,
    verifyPassword
  };
};

// Initialize encryption on app startup
export const initializeEncryption = (): void => {
  // Generate master key if not exists
  if (!localStorage.getItem('encryption_master_key')) {
    const masterKey = encryption.generateMasterKey();
    localStorage.setItem('encryption_master_key', masterKey);
  }
};

export default encryption;
