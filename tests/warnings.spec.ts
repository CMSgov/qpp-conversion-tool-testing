import fs from 'fs';
import path from 'path';
import { uploadQrdaFile, saveResultJson, clearResultsFor } from '../src/utils/helper';
import { config } from 'dotenv';

config();
const year = parseInt(process.env.CT_YEAR || '2025', 10);

describe('Warning Messages Validation', () => {
  beforeAll(() => clearResultsFor('warnings'));

  it('should accept PCF-9a with IA section but return warning messages', async () => {
    const filename = 'PCF-9a-IASectionAdded_09182024.xml';
    const filePath = path.resolve(__dirname, `../test-data/2025-sample-files/warning/${filename}`);

    try {
      const response = await uploadQrdaFile(filePath);
      expect(response.status).toBe(201);
      saveResultJson(filename, response.data, 'warnings');

      // Validate the QPP object structure
      expect(response.data).toMatchObject({
        qpp: {
          performanceYear: 2025,
          entityType: "apm",
          entityId: "AR0437",
          measurementSets: expect.arrayContaining([
            expect.objectContaining({
              category: "quality",
              submissionMethod: "electronicHealthRecord",
              programName: "pcf"
            }),
            expect.objectContaining({
              category: "ia",
              submissionMethod: "electronicHealthRecord",
              programName: "pcf"
            })
          ])
        }
      });

      // Assert that warnings array contains the expected warning about IA section
      expect(response.data.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            errorCode: 90,
            message: "CT - The QRDA-III submission for PCF should not contain an Improvement Activities section. The Improvement Activities data will be ignored."
          })
        ])
      );

      // Assert that warnings array contains the expected warning about NPI/TIN combinations
      // expect(response.data.warnings).toEqual(
      //   expect.arrayContaining([
      //     expect.objectContaining({
      //       errorCode: 108,
      //       message: expect.stringContaining("CT - Found an unexpected NPI/TIN combination.")
      //     }),
      //     expect.objectContaining({
      //       errorCode: 107,
      //       message: expect.stringContaining("CT - There's missing NPI/TIN combination.")
      //     })
      //   ])
      // );
    } catch (error: any) {
      console.error('Error during upload', error);
      expect(error).toBeUndefined(); // This will fail the test if an error occurs
    }
  });
});
