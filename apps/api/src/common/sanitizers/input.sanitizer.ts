import { BadRequestException } from '@nestjs/common';

/**
 * Input Sanitization Helpers
 * Prevents XSS and injection attacks
 */

// XSS prevention: escape HTML special characters
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

// Remove HTML tags
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

// Sanitize string input
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    throw new BadRequestException('Input must be a string');
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Escape HTML to prevent XSS
  sanitized = escapeHtml(sanitized);

  return sanitized;
}

// Sanitize email
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email).toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new BadRequestException('Invalid email format');
  }

  return sanitized;
}

// Sanitize URL
export function sanitizeUrl(url: string): string {
  const sanitized = sanitizeString(url);

  // Check for valid protocol
  try {
    const parsed = new URL(sanitized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new BadRequestException('Invalid URL protocol');
    }
    return sanitized;
  } catch {
    throw new BadRequestException('Invalid URL format');
  }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');

  // Remove path separators
  sanitized = sanitized.replace(/[/\\]/g, '');

  // Allow only alphanumeric, dash, underscore, and dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (sanitized.length === 0) {
    throw new BadRequestException('Invalid filename');
  }

  return sanitized;
}

// Sanitize object recursively
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
