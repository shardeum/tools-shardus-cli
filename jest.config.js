module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.(js|ts)', '**/?(*.)+(spec|test).(js|ts)'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'index.js',
    'bin/**/*.js',
    '!**/node_modules/**',
    '!**/build/**',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
}; 