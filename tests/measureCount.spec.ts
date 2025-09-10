import fs from 'fs';
import path from 'path';
import { saveResultJson, clearResultsFor, uploadQrdaFile } from '../src/utils/helper';
import { config } from 'dotenv';

config();
const year = 2025;

// Define types for the response structure
interface Measurement {
  measureId: string;
  value: boolean | {
    numerator?: number;
    denominator?: number;
    performanceMet?: number;
    eligiblePopulation?: number;
    eligiblePopulationException?: number;
    performanceNotMet?: number;
    isEndToEndReported?: boolean;
  };
}

interface MeasurementSet {
  category: string;
  submissionMethod: string;
  measurements: Measurement[];
  programName: string;
  performanceStart: string;
  performanceEnd: string;
  source: string;
}

interface CategoryMeasurements {
  measureCount: number;
  measurements: Measurement[];
}

type MeasurementsByCategory = Record<string, CategoryMeasurements>;

describe('Measure Count Validation Tests', () => {
  // Define test cases with expected measure counts
  const testCases = [
    {
      file: 'MIPS-1b-LowerCaseProgramName_04172025.xml',
      folder: 'success/apm',
      expectedCounts: {
        quality: 1 // Actual count from APM MIPS file
      }
    },
    {
      file: 'MIPS-1e-MIPS_INDIV_04172025.xml',
      folder: 'success/individual',
      expectedCounts: {
        quality: 3 // Expected number of quality measures - will verify and update
      }
    },
    {
      file: 'MIPS-1f-MIPS_GROUP_04172025.xml',
      folder: 'success/group',
      expectedCounts: {
        quality: 3 // Expected number of quality measures - will verify and update
      }
    },
    {
      file: 'MIPS-1g-MIPS_VIRTUALGROUP_04172025.xml',
      folder: 'success/virtualGroup',
      expectedCounts: {
        quality: 3 // Expected number of quality measures - will verify and update
      }
    }
    // Add more test cases as needed
  ];

  beforeAll(() => clearResultsFor('measureCount'));

  testCases.forEach(testCase => {
    it(`should have the correct number of measures for ${testCase.file}`, async () => {
      const filePath = path.resolve(__dirname, `../test-data/2025-sample-files/${testCase.folder}/${testCase.file}`);
      const response = await uploadQrdaFile(filePath);
      saveResultJson(testCase.file, response.data, 'measureCount');

      expect(response.status).toBe(201);

      // Validate the response has measurementSets
      expect(response.data.qpp).toHaveProperty('measurementSets');

      // Get counts by category
      const measurementsByCategory: MeasurementsByCategory = {};
      response.data.qpp.measurementSets.forEach((ms: MeasurementSet) => {
        if (!measurementsByCategory[ms.category]) {
          measurementsByCategory[ms.category] = {
            measureCount: 0,
            measurements: []
          };
        }

        measurementsByCategory[ms.category].measureCount += ms.measurements.length;
        measurementsByCategory[ms.category].measurements.push(...ms.measurements);
      });

      // Validate the counts
      Object.keys(testCase.expectedCounts).forEach(category => {
        expect(measurementsByCategory).toHaveProperty(category);
        expect(measurementsByCategory[category].measureCount).toBe(testCase.expectedCounts[category as keyof typeof testCase.expectedCounts]);
      });

      // Additional validations specific to measure types
      if (measurementsByCategory['quality']) {
        measurementsByCategory['quality'].measurements.forEach((measurement: Measurement) => {
          expect(measurement).toHaveProperty('measureId');
          expect(measurement).toHaveProperty('value');
          // Validate quality measure has proper structure
          if (typeof measurement.value === 'object') {
            expect(measurement.value).toHaveProperty('performanceMet');
            expect(measurement.value).toHaveProperty('eligiblePopulation');
          }
        });
      }

      // Only validate PI measures if they exist
      if (measurementsByCategory['pi']) {
        measurementsByCategory['pi'].measurements.forEach((measurement: Measurement) => {
          expect(measurement).toHaveProperty('measureId');
          expect(measurement).toHaveProperty('value');
          // PI measures can be boolean or have numerator/denominator
          if (typeof measurement.value !== 'boolean') {
            expect(measurement.value).toHaveProperty('numerator');
            expect(measurement.value).toHaveProperty('denominator');
          }
        });
      }
    });
  });

  // Test for minimum required measures
  it('should validate minimum required measure counts', async () => {
    // This test would check that each submission has the minimum required measures by program
    // For example, MIPS might require at least 6 quality measures
    const filePath = path.resolve(__dirname, '../test-data/2025-sample-files/success/apm/MIPS-1b-LowerCaseProgramName_04172025.xml');
    const response = await uploadQrdaFile(filePath);

    expect(response.status).toBe(201);

    // Get all measures by category
    const qualityMeasures = response.data.qpp.measurementSets
      .filter((ms: MeasurementSet) => ms.category === 'quality')
      .flatMap((ms: MeasurementSet) => ms.measurements);

    // Example validation - adjust based on actual requirements
    expect(qualityMeasures.length).toBeGreaterThanOrEqual(1);
  });

  // Test for duplicate measures
  it('should not have duplicate measure IDs within the same category', async () => {
    const filePath = path.resolve(__dirname, '../test-data/2025-sample-files/success/apm/MIPS-1b-LowerCaseProgramName_04172025.xml');
    const response = await uploadQrdaFile(filePath);

    expect(response.status).toBe(201);

    response.data.qpp.measurementSets.forEach((ms: MeasurementSet) => {
      const measureIds = ms.measurements.map(m => m.measureId);
      const uniqueMeasureIds = new Set(measureIds);

      // Number of unique IDs should match total number of measures
      expect(uniqueMeasureIds.size).toBe(measureIds.length);
    });
  });

  // Test for files without measures - should return an error
  it('should return an error when file has no measures', async () => {
    const filename = 'MIPS-NoMeasures_09102025.xml';
    const filePath = path.resolve(__dirname, `../test-data/2025-sample-files/failures/custom/${filename}`);

    try {
      const response = await uploadQrdaFile(filePath);
      console.error(`Unexpected success for file: ${filename}, received status: ${response.status}`);
      expect(response.status).toBe(422);
    } catch (error: any) {
      if (error.response) {
        expect(error.response.status).toBe(422);
        saveResultJson(filename, error.response.data, 'measureCount');

        // Should get error code 32 about Quality Measure section structure 
        // This validates that the file has issues with quality measures
        expect(error.response.data).toMatchObject({
          errors: [
            {
              sourceIdentifier: filename,
              type: null,
              message: null,
              details: expect.arrayContaining([
                expect.objectContaining({
                  errorCode: 32,
                  message: expect.stringContaining("Quality Measure section")
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
