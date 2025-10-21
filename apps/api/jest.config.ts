import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  rootDir: './',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@mile/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@mile/shared/(.*)$': '<rootDir>/../../packages/shared/src/$1',
  },
  testEnvironment: 'node',
};

export default config;
