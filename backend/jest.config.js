module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  verbose: true,
};
