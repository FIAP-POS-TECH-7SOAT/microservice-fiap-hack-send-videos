export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageReporters: ['lcov', 'text'],
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coveragePathIgnorePatterns: [
    '/dist/',
    '\\.module\\.ts$',
    '/prisma/',
    '\\.spec\\.ts$',
    '\\.test\\.ts$',
  ],
  coverageDirectory: './coverage/unit',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@adapters/(.*)$': '<rootDir>/src/adapters/$1',
  },
};
