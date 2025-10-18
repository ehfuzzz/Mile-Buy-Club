import { Injectable } from '@nestjs/common';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'log', 'debug', 'verbose']).default('log'),
});

export type Environment = z.infer<typeof envSchema>;

@Injectable()
export class ConfigService {
  private env: Environment;

  constructor() {
    this.env = envSchema.parse(process.env);
  }

  get<K extends keyof Environment>(key: K): Environment[K] {
    return this.env[key];
  }

  getAll(): Environment {
    return this.env;
  }

  isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  isTest(): boolean {
    return this.env.NODE_ENV === 'test';
  }
}
