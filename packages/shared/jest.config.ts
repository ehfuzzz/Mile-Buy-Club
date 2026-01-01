import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  rootDir: './',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};

export default config;
