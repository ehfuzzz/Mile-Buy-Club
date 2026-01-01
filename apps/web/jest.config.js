const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@mile/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@mile/shared/(.*)$': '<rootDir>/../../packages/shared/src/$1',
    '^framer-motion$': '<rootDir>/lib/framer-motion-stub',
  },
};

module.exports = createJestConfig(customJestConfig);
