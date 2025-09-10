import fs from 'fs';
import path from 'path';
import { saveResultJson, clearResultsFor, uploadQrdaFile } from '../src/utils/helper';
import { config } from 'dotenv';
import { NPI_REGEX, TIN_REGEX, PERFORMANCE_START_REGEX, PERFORMANCE_END_REGEX } from '../src/utils/regexes';

config();
const year = 2025;
type ApmFileKey = 'MIPS-1b' | 'AppPlus-1b' | 'MIPS-1d' | 'AppPlus-1d' | 'MIPS-28e' | 'AppPlus-28e' | 'MIPS-12d' | 'MIPS-12e' | 'MIPS-12f' | 'MIPS-12g' | 'MIPS-16a' | 'MIPS-16b' | 'MIPS-23a' | 'MIPS-24a' | 'MIPS-24b' | 'MIPS-24c' | 'MIPS-24k' | 'MIPS-24l' | 'MIPS-5b' | 'MIPS-5c' | 'Mvp_Mips-APM-Sample' | 'default';

const apmEntityIds: Record<ApmFileKey, string> = {
    'MIPS-1b': 'MIPS1001',
    'AppPlus-1b': 'CA1028',
    'MIPS-1d': 'MIPS1001',
    'AppPlus-1d': 'CA1196',
    'MIPS-28e': 'MIPS1001',
    'AppPlus-28e': 'AR0437',
    'MIPS-12d': 'MIPS1001',
    'MIPS-12e': 'MIPS1001',
    'MIPS-12f': 'MIPS1001',
    'MIPS-12g': 'MIPS1001',
    'MIPS-16a': 'MIPS1001',
    'MIPS-16b': 'MIPS1001',
    'MIPS-23a': 'MIPS1001',
    'MIPS-24a': 'MIPS1001',
    'MIPS-24b': 'MIPS1001',
    'MIPS-24c': 'MIPS1001',
    'MIPS-24k': 'MIPS1001',
    'MIPS-24l': 'MIPS1001',
    'MIPS-5b': 'MIPS1001',
    'MIPS-5c': 'MIPS1001',
    'Mvp_Mips-APM-Sample': 'MIPS1001',
    'default': 'AR0437'
};

const getEntityIdForFile = (file: string, entityIds: Record<ApmFileKey, string>): string => {
    const key = (Object.keys(entityIds) as ApmFileKey[]).find(k => k !== 'default' && file.includes(k));
    return key ? entityIds[key] : entityIds.default;
};

const testConfigs = {
    apm: { folder: 'success/apm', entityType: 'apm', entityIds: apmEntityIds },
    group: { folder: 'success/group', entityType: 'group' },
    individual: { folder: 'success/individual', entityType: 'individual' },
    virtualGroup: { folder: 'success/virtualGroup', entityType: 'virtualGroup', expectedEntityId: 'MVGID' },
};

describe('Valid QRDA files for APM should be successfully converted into json format', () => {
    beforeAll(() => clearResultsFor('apm'));
    const folderApm = path.resolve(__dirname, `../test-data/2025-sample-files/${testConfigs.apm.folder}`);
    const xmlFilesApm = fs.readdirSync(folderApm)
        .filter(file => file.endsWith('.xml'))
        .filter(file => !file.includes('_temp.xml'))  // Exclude temporary files
        .filter(file => !file.includes('_converted.xml'));  // Exclude converted files
    // Test for each XML file
    xmlFilesApm.forEach((file) => {
        it(`should return 201 for valid apm file ${file}`, async () => {
            const filePath = path.join(folderApm, file);
            const response = await uploadQrdaFile(filePath);
            saveResultJson(file, response.data, 'apm');
            expect(response.status).toBe(201);
            expect(response.data.qpp).toMatchObject({
                performanceYear: year,
                entityType: testConfigs.apm.entityType,
                entityId: getEntityIdForFile(file, testConfigs.apm.entityIds),
                measurementSets: expect.arrayContaining([
                    expect.objectContaining({ submissionMethod: 'electronicHealthRecord' }),
                    expect.objectContaining({ performanceStart: expect.stringMatching(PERFORMANCE_START_REGEX) }),
                    expect.objectContaining({ performanceEnd: expect.stringMatching(PERFORMANCE_END_REGEX) }),
                    expect.objectContaining({ source: 'qrda3' })]),
            });
            expect(response.data.warnings).toEqual(expect.any(Array));
        });
    });
});

describe('Valid QRDA files for VG should be successfully converted into json format', () => {
    beforeAll(() => clearResultsFor('virtualGroup'));
    const folderPathVG = path.resolve(__dirname, `../test-data/2025-sample-files/${testConfigs.virtualGroup.folder}`)
    const xmlFilesVG = fs.readdirSync(folderPathVG).filter(file => file.endsWith('.xml'));
    xmlFilesVG.forEach((file) => {
        it(`should return 201 for valid virtualGroup file ${file}`, async () => {
            const filePath = path.join(folderPathVG, file);
            const response = await uploadQrdaFile(filePath);
            saveResultJson(file, response.data, 'virtualGroup');
            expect(response.status).toBe(201);
            expect(response.data.qpp).toMatchObject({
                performanceYear: year,
                entityType: testConfigs.virtualGroup.entityType,
                entityId: testConfigs.virtualGroup.expectedEntityId,
                measurementSets: expect.arrayContaining([
                    expect.objectContaining({ submissionMethod: 'electronicHealthRecord' }),
                    expect.objectContaining({ performanceStart: expect.stringMatching(PERFORMANCE_START_REGEX) }),
                    expect.objectContaining({ performanceEnd: expect.stringMatching(PERFORMANCE_END_REGEX) }),
                    expect.objectContaining({ source: 'qrda3' })]),
            });
            expect(response.data.warnings).toEqual(expect.any(Array));
        });
    });
});

describe('Valid QRDA files for Group should be successfully converted into json format', () => {
    beforeAll(() => clearResultsFor('group'));
    const folderPathGroup = path.resolve(__dirname, `../test-data/2025-sample-files/${testConfigs.group.folder}`)
    const xmlFilesGroup = fs.readdirSync(folderPathGroup).filter(file => file.endsWith('.xml'));
    xmlFilesGroup.forEach((file) => {
        it(`should return 201 for valid group file ${file}`, async () => {
            const filePath = path.join(folderPathGroup, file);
            const response = await uploadQrdaFile(filePath);
            saveResultJson(file, response.data, 'group');
            expect(response.status).toBe(201);
            expect(response.data.qpp).toMatchObject({
                performanceYear: year,
                entityType: testConfigs.group.entityType,
                taxpayerIdentificationNumber: expect.stringMatching(TIN_REGEX),
                measurementSets: expect.arrayContaining([
                    expect.objectContaining({ submissionMethod: 'electronicHealthRecord' }),
                    expect.objectContaining({ performanceStart: expect.stringMatching(PERFORMANCE_START_REGEX) }),
                    expect.objectContaining({ performanceEnd: expect.stringMatching(PERFORMANCE_END_REGEX) }),
                    expect.objectContaining({ source: 'qrda3' })]),
            });
            expect(response.data.warnings).toEqual([]);
        });
    });
});

describe('Valid QRDA files for Individual should be successfully converted into json format', () => {
    beforeAll(() => clearResultsFor('individual'));
    const folderPathInd = path.resolve(__dirname, `../test-data/2025-sample-files/${testConfigs.individual.folder}`)
    const xmlFilesInd = fs.readdirSync(folderPathInd).filter(file => file.endsWith('.xml'));
    xmlFilesInd.forEach((file) => {
        it(`should return 201 for valid individual file ${file}`, async () => {
            const filePath = path.join(folderPathInd, file);
            const response = await uploadQrdaFile(filePath);
            saveResultJson(file, response.data, 'individual');
            expect(response.status).toBe(201);
            expect(response.data.qpp).toMatchObject({
                performanceYear: year,
                entityType: testConfigs.individual.entityType,
                taxpayerIdentificationNumber: expect.stringMatching(TIN_REGEX),
                nationalProviderIdentifier: expect.stringMatching(NPI_REGEX),
                measurementSets: expect.arrayContaining([
                    expect.objectContaining({ submissionMethod: 'electronicHealthRecord' }),
                    expect.objectContaining({ performanceStart: expect.stringMatching(PERFORMANCE_START_REGEX) }),
                    expect.objectContaining({ performanceEnd: expect.stringMatching(PERFORMANCE_END_REGEX) }),
                    expect.objectContaining({ source: 'qrda3' })]),
            });
            expect(response.data.warnings).toEqual([]);
        });
    });
});
