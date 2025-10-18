import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Common weak passwords (sample list)
const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  '1234567',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
]);

export class PasswordValidator {
  static validate(password: string): void {
    // Check length
    if (password.length < 12) {
      throw new BadRequestException('Password must be at least 12 characters long');
    }

    // Check complexity
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      throw new BadRequestException(
        'Password must contain uppercase, lowercase, number, and special character'
      );
    }

    // Check against common passwords
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      throw new BadRequestException('This password is too common. Please choose a stronger password');
    }

    // Check for sequential characters
    if (/(.)\1{2,}/.test(password)) {
      throw new BadRequestException('Password cannot contain repeated characters (e.g., aaa, 111)');
    }
  }

  static async hash(password: string): Promise<string> {
    this.validate(password);
    const salt = await bcrypt.genSalt(12); // Cost factor 12
    return bcrypt.hash(password, salt);
  }

  static async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
