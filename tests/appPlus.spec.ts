import fs from 'fs';
import path from 'path';
import { saveResultJson, clearResultsFor, uploadQrdaFile } from '../src/utils/helper';
import { config } from 'dotenv';
import { NPI_REGEX, TIN_REGEX, PERFORMANCE_START_REGEX, PERFORMANCE_END_REGEX } from '../src/utils/regexes';

config();
const year = parseInt(process.env.CT_YEAR || '2025', 10);

// Test configurations for appPlus program
const testConfigs = {
  apm: {
    folder: 'appPlus',
    entityType: 'apm',
    entityIds: { 'default': 'MIPS1001' }
  },
  group: {
    folder: 'appPlus',
    entityType: 'group'
  },
  individual: {
    folder: 'appPlus',
    entityType: 'individual'
  }
};

// Helper function to filter files by entity type
const getFilesByPattern = (directory: string, pattern: string): string[] => {
  return fs.readdirSync(directory)
    .filter(file => file.endsWith('.xml') && file.toLowerCase().includes(pattern.toLowerCase()));
};

describe('Valid appPlus QRDA files for APM should be successfully converted into json format', () => {
  beforeAll(() => clearResultsFor('appPlus_apm'));
  const folderPath = path.resolve(__dirname, `../test-data/2025-sample-files/${testConfigs.apm.folder}`);
  const xmlFiles = getFilesByPattern(folderPath, 'Apm');

  xmlFiles.forEach((file) => {
    it(`should return 201 for valid appPlus APM file ${file}`, async () => {
      const filePath = path.join(folderPath, file);
      const response = await uploadQrdaFile(filePath);
      saveResultJson(file, response.data, 'appPlus_apm');
      expect(response.status).toBe(201);
      expect(response.data.qpp).toMatchObject({
        performanceYear: year,
        entityType: testConfigs.apm.entityType,
        entityId: testConfigs.apm.entityIds.default,
        measurementSets: expect.arrayContaining([
          expect.objectContaining({ submissionMethod: 'electronicHealthRecord' }),
          expect.objectContaining({ programName: 'appPlus' }),
          expect.objectContaining({ performanceStart: expect.stringMatching(PERFORMANCE_START_REGEX) }),
          expect.objectContaining({ performanceEnd: expect.stringMatching(PERFORMANCE_END_REGEX) }),
          expect.objectContaining({ source: 'qrda3' })]),
      });
      expect(response.data.warnings).toEqual(expect.any(Array));
    });
  });
});

describe('Valid appPlus QRDA files for Group should be successfully converted into json format', () => {
  beforeAll(() => clearResultsFor('appPlus_group'));
  const folderPath = path.resolve(__dirname, `../test-data/2025-sample-files/${testConfigs.group.folder}`);
  const xmlFiles = getFilesByPattern(folderPath, 'Group');

  xmlFiles.forEach((file) => {
    it(`should return 201 for valid appPlus Group file ${file}`, async () => {
      const filePath = path.join(folderPath, file);
      const response = await uploadQrdaFile(filePath);
      saveResultJson(file, response.data, 'appPlus_group');
      expect(response.status).toBe(201);
      expect(response.data.qpp).toMatchObject({
        performanceYear: year,
        entityType: testConfigs.group.entityType,
        taxpayerIdentificationNumber: expect.stringMatching(TIN_REGEX),
        measurementSets: expect.arrayContaining([
          expect.objectContaining({ submissionMethod: 'electronicHealthRecord' }),
          expect.objectContaining({ programName: 'appPlus' }),
          expect.objectContaining({ performanceStart: expect.stringMatching(PERFORMANCE_START_REGEX) }),
          expect.objectContaining({ performanceEnd: expect.stringMatching(PERFORMANCE_END_REGEX) }),
          expect.objectContaining({ source: 'qrda3' })]),
      });
      expect(response.data.warnings).toEqual(expect.any(Array));
    });
  });
});

describe('Valid appPlus QRDA files for Individual should be successfully converted into json format', () => {
  beforeAll(() => clearResultsFor('appPlus_individual'));
  const folderPath = path.resolve(__dirname, `../test-data/2025-sample-files/${testConfigs.individual.folder}`);
  const xmlFiles = getFilesByPattern(folderPath, 'Indv');

  xmlFiles.forEach((file) => {
    it(`should return 201 for valid appPlus Individual file ${file}`, async () => {
      const filePath = path.join(folderPath, file);
      const response = await uploadQrdaFile(filePath);
      saveResultJson(file, response.data, 'appPlus_individual');
      expect(response.status).toBe(201);
      expect(response.data.qpp).toMatchObject({
        performanceYear: year,
        entityType: testConfigs.individual.entityType,
        taxpayerIdentificationNumber: expect.stringMatching(TIN_REGEX),
        nationalProviderIdentifier: expect.stringMatching(NPI_REGEX),
        measurementSets: expect.arrayContaining([
          expect.objectContaining({ submissionMethod: 'electronicHealthRecord' }),
          expect.objectContaining({ programName: 'appPlus' }),
          expect.objectContaining({ performanceStart: expect.stringMatching(PERFORMANCE_START_REGEX) }),
          expect.objectContaining({ performanceEnd: expect.stringMatching(PERFORMANCE_END_REGEX) }),
          expect.objectContaining({ source: 'qrda3' })]),
      });
      expect(response.data.warnings).toEqual(expect.any(Array));
    });
  });
});
