import path from 'path';
import { uploadQrdaFile } from '../src/utils/helper';
import { config } from 'dotenv';
import { expectedProgramName } from '../src/utils/test-records';

config();

describe("Program name validation per QRDA XML file", () => {
  const folderPath = path.resolve(__dirname, "../test-data/2025-sample-files/success");

  // beforeAll(() => {
  //   console.log('Running tests with 2025 sample files');
  // });

  Object.keys(expectedProgramName).forEach((expProgramName) => {
    it(`should return ${expProgramName} programName for the corresponding XML file`, async () => {
      jest.setTimeout(30000); // 30 seconds timeout for this test
      const fileName = expectedProgramName[expProgramName];
      const filePath = path.join(folderPath, fileName);
      const response = await uploadQrdaFile(filePath);
      //console.log(response.data);
      expect(response.status).toBe(201);
      expect(response.data.qpp).toMatchObject({
        measurementSets: expect.arrayContaining([
          expect.objectContaining({ programName: expProgramName }),
        ]),
      });
    });
  });
});