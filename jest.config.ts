import { getEnv, getReportName, getReportTimestamp } from './src/utils/helper';
const env = getEnv();
const reportName = getReportName();
const timestamp = getReportTimestamp();

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testTimeout: 20000, // Global timeout set to 20 seconds
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  reporters: [
    'default',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: `[${env}] ${reportName.charAt(0).toUpperCase() + reportName.slice(1).split('-')[0]} Test Report`,
        outputPath: `./reports/${reportName}-${timestamp}.html`,
        includeFailureMsg: true,
        sort: 'status',
      },
    ],
  ],
};