import fs from 'fs';
import path from 'path';
import { clearResultsFor, saveResultJson, uploadQrdaFile } from '../src/utils/helper';
import { config } from 'dotenv';

beforeAll(() => {
  clearResultsFor('failures');
});
describe('Invalid QRDA files should not be converted into json format', () => {
  const folderPath = path.resolve(__dirname, '../test-data/2025-sample-files/failures');
  // Get all XML files in the folder
  const xmlFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.xml'));
  // Test for each XML file
  for (const file of xmlFiles) {
    it(`should return 422 for invalid file ${file}`, async () => {
      const filePath = path.join(folderPath, file);
      try {
        const response = await uploadQrdaFile(filePath);
        console.error(`Unexpected success for file: ${file}, received status: ${response.status}`);
        expect(response.status).toBe(422);
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).toBe(422);

          saveResultJson(file, error.response.data, 'failures');
          // Assert that error response contains expected structure
          expect(error.response.data).toMatchObject({
            errors: [
              {
                sourceIdentifier: file,
                type: null,
                message: null,
                details: expect.any(Array)
              }
            ]
          });
          // console.log(error.response.data);
          // console.log(`Expected failure for file: ${file}`);
        } else {
          console.error('Error during upload', error);
          expect(error).toBeUndefined();
        }
      }
    });
  }
});
