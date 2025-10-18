import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;

  constructor(private configService: ConfigService) {}

  async encrypt(text: string): Promise<string> {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not configured');
    }

    const salt = randomBytes(this.saltLength);
    const key = (await scryptAsync(encryptionKey, salt, this.keyLength)) as Buffer;
    const iv = randomBytes(this.ivLength);
    
    const cipher = createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine salt, iv, authTag, and encrypted data
    const result = Buffer.concat([salt, iv, authTag, Buffer.from(encrypted, 'hex')]);
    
    return result.toString('base64');
  }

  async decrypt(encryptedText: string): Promise<string> {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not configured');
    }

    const buffer = Buffer.from(encryptedText, 'base64');
    
    // Extract components
    const salt = buffer.subarray(0, this.saltLength);
    const iv = buffer.subarray(this.saltLength, this.saltLength + this.ivLength);
    const authTag = buffer.subarray(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength
    );
    const encrypted = buffer.subarray(this.saltLength + this.ivLength + this.tagLength);
    
    const key = (await scryptAsync(encryptionKey, salt, this.keyLength)) as Buffer;
    
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  async encryptObject<T extends Record<string, any>>(
    obj: T,
    fieldsToEncrypt: (keyof T)[]
  ): Promise<T> {
    const encrypted = { ...obj };

    for (const field of fieldsToEncrypt) {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = await this.encrypt(encrypted[field] as string) as any;
      }
    }

    return encrypted;
  }

  async decryptObject<T extends Record<string, any>>(
    obj: T,
    fieldsToDecrypt: (keyof T)[]
  ): Promise<T> {
    const decrypted = { ...obj };

    for (const field of fieldsToDecrypt) {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = await this.decrypt(decrypted[field] as string) as any;
        } catch (error) {
          // If decryption fails, field might not be encrypted
          console.warn(`Failed to decrypt field ${String(field)}`);
        }
      }
    }

    return decrypted;
  }
}
