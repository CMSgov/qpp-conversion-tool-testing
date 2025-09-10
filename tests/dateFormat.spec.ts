import fs from 'fs';
import path from 'path';
import { uploadQrdaFile, saveResultJson, clearResultsFor } from '../src/utils/helper';
import { config } from 'dotenv';

config();
const year = 2025;

describe('Performance Period Date Format Validation', () => {
  beforeAll(() => clearResultsFor('dateFormat'));

  it('should reject MIPS-11a with incorrect performance period start/end dates', async () => {
    const filename = 'MIPS-11a-ImproperPerformancePeriod_04212025.xml';
    const filePath = path.resolve(__dirname, `../test-data/2025-sample-files/failures/${filename}`);

    try {
      const response = await uploadQrdaFile(filePath);
      console.error(`Unexpected success for file: ${filename}, received status: ${response.status}`);
      expect(response.status).toBe(422);
    } catch (error: any) {
      if (error.response) {
        expect(error.response.status).toBe(422);
        saveResultJson(filename, error.response.data, 'dateFormat');

        // Current validation system uses error code 69 for date format validation
        // instead of the old error codes 55, 56
        expect(error.response.data).toMatchObject({
          errors: [
            {
              sourceIdentifier: filename,
              type: null,
              message: null,
              details: expect.arrayContaining([
                expect.objectContaining({
                  errorCode: 69,
                  message: expect.stringContaining("Review the")
                })
              ])
            }
          ]
        });
      } else {
        console.error('Error during upload', error);
        expect(error).toBeUndefined();
      }
    }
  });

  it('should reject MIPS-11b with incorrect performance period format', async () => {
    const filename = 'MIPS-11b-ImproperPerformancePeriod-2_04212025.xml';
    const filePath = path.resolve(__dirname, `../test-data/2025-sample-files/failures/${filename}`);

    try {
      const response = await uploadQrdaFile(filePath);
      console.error(`Unexpected success for file: ${filename}, received status: ${response.status}`);
      expect(response.status).toBe(422);
    } catch (error: any) {
      if (error.response) {
        expect(error.response.status).toBe(422);
        saveResultJson(filename, error.response.data, 'dateFormat');

        // Current validation system uses error code 69 for date format validation
        // instead of the old error codes 55, 56
        expect(error.response.data).toMatchObject({
          errors: [
            {
              sourceIdentifier: filename,
              type: null,
              message: null,
              details: expect.arrayContaining([
                expect.objectContaining({
                  errorCode: 69,
                  message: expect.stringContaining("Review the")
                })
              ])
            }
          ]
        });
      } else {
        console.error('Error during upload', error);
        expect(error).toBeUndefined();
      }
    }
  });

  it('should reject MIPS-11c with missing performance period', async () => {
    const filename = 'MIPS-11c-NoPerformancePeriod_04212025.xml';
    const filePath = path.resolve(__dirname, `../test-data/2025-sample-files/failures/${filename}`);

    try {
      const response = await uploadQrdaFile(filePath);
      console.error(`Unexpected success for file: ${filename}, received status: ${response.status}`);
      expect(response.status).toBe(422);
    } catch (error: any) {
      if (error.response) {
        expect(error.response.status).toBe(422);
        saveResultJson(filename, error.response.data, 'dateFormat');

        // Assert that error response contains expected structure with specific error code and message
        expect(error.response.data).toMatchObject({
          errors: [
            {
              sourceIdentifier: filename,
              type: null,
              message: null,
              details: expect.arrayContaining([
                expect.objectContaining({
                  errorCode: 32,
                  message: "CT - The Quality Measure section must only have one Reporting Parameter Act. You can find more information on performance periods in the Implementation Guide: https://ecqi.healthit.gov/sites/default/files/2025-CMS-QRDA-III-EC-IG-v1.1.pdf#page=17"
                })
              ])
            }
          ]
        });
      } else {
        console.error('Error during upload', error);
        expect(error).toBeUndefined();
      }
    }
  });
});
