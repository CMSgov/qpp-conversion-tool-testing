import fs from 'fs';
import path from 'path';
import { uploadQrdaFile, saveResultJson, clearResultsFor } from '../src/utils/helper';
import { config } from 'dotenv';

config();

describe('Warning Tests', () => {
  beforeAll(() => clearResultsFor('warnings'));

  it('should successfully process MIPS file (warning test placeholder)', async () => {
    const filename = 'MIPS-1b-LowerCaseProgramName_Warning_09102025.xml';
    const filePath = path.resolve(__dirname, `../test-data/2025-sample-files/warning/${filename}`);

    try {
      const response = await uploadQrdaFile(filePath);
      expect(response.status).toBe(201);
      saveResultJson(filename, response.data, 'warnings');

      // Validate the QPP object structure for MIPS APM
      expect(response.data).toMatchObject({
        qpp: {
          performanceYear: 2025,
          entityType: "apm",
          measurementSets: expect.arrayContaining([
            expect.objectContaining({
              category: "quality",
              submissionMethod: "electronicHealthRecord",
              programName: expect.any(String)
            })
          ])
        }
      });

      // TODO: Add actual warning validation when warning-generating files are available
      // For now, verify the warnings array structure exists
      expect(response.data).toHaveProperty('warnings');
      expect(Array.isArray(response.data.warnings)).toBe(true);

      // If warnings exist, validate their structure
      if (response.data.warnings && response.data.warnings.length > 0) {
        expect(response.data.warnings).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              errorCode: expect.any(Number),
              message: expect.stringContaining("CT -")
            })
          ])
        );
        console.log(`Found ${response.data.warnings.length} warnings`);
      } else {
        console.log('No warnings in current test file - this is a placeholder test for warning framework validation');
      }

    } catch (error: any) {
      if (error.response) {
        console.error(`Unexpected error for file: ${filename}`, error.response.data);
        saveResultJson(filename, error.response.data, 'warnings');

        // MIPS files should process successfully, so this is unexpected
        expect(error.response.status).toBe(201);
      } else {
        console.error('Network/system error during upload', error);
        expect(error).toBeUndefined();
      }
    }
  });
});
