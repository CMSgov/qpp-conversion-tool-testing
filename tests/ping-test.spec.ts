import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

// Force DEV environment for this test
const env = 'DEV';
const baseUrl = process.env.URL_DEV || 'https://dev.qpp.cms.gov';

console.log(`Running ping-test in ${env} environment with base URL: ${baseUrl}`);

const SUBMISSIONS_API_PREFIX = `${baseUrl}/api/submissions`;

const endpoints = [
  `${SUBMISSIONS_API_PREFIX}/health`
];

describe('API Health Check', () => {
  test.each(endpoints)(`verify API at %s is reachable in ${env} environment`, async (endpoint) => {
    try {
      // Simple request with timeout - no special headers needed for DEV
      const res = await axios.get(endpoint, {
        timeout: 30000 // Extended timeout
      });

      expect(res.status).toBe(200);
      console.log(`Successfully connected to ${endpoint} in ${env} environment`);
    } catch (error: any) {
      console.error(`Failed to connect to ${endpoint}: ${error.message || 'Unknown error'}`);
      throw `Endpoint ${endpoint} was not reachable in ${env} environment.`;
    }
  });
});