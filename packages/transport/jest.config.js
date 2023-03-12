const { testPathIgnorePatterns } = require('../../jest.config.base');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testMatch: ['**/tests/*.test.ts'],
    modulePathIgnorePatterns: ['node_modules', '<rootDir>/lib', '<rootDir>/libDev'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts'],
    testPathIgnorePatterns: [...testPathIgnorePatterns, 'e2e'],
};
