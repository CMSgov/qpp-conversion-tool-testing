import fs from 'fs';
import path from 'path';
import { saveResultJson, clearResultsFor, uploadQrdaFile } from '../src/utils/helper';
import { config } from 'dotenv';
import { NPI_REGEX, TIN_REGEX } from '../src/utils/regexes';

config();
const year = 2026;
// PY2026 sample files aren't yet split into apm/group/individual/virtualGroup subfolders like PY2025
const PERFORMANCE_START_REGEX_2026 = /^2026-01-01$/;
const PERFORMANCE_END_REGEX_2026 = /^2026-12-31$/;

const entityTypeByFile: Record<string, string> = {
    'Mvp_Mips-APM-Sample.xml': 'apm',
    'Mvp_Mips-Group-Sample.xml': 'group',
    'Mvp_Mips-Ind-Sample.xml': 'individual',
    'Mvp_Mips-Subgroup-Sample.xml': 'subgroup',
    'MultiStrata_SinglePerformanceRate-sample.xml': 'individual',
};

const entityIdByFile: Record<string, string> = {
    'Mvp_Mips-APM-Sample.xml': 'MIPS1001',
    'Mvp_Mips-Subgroup-Sample.xml': 'SG-00000001',
};

describe('Valid QRDA files for PY2026 should be successfully converted into json format', () => {
    beforeAll(() => clearResultsFor('py2026'));
    const folderPath = path.resolve(__dirname, '../test-data/2026-sample-files');
    const xmlFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.xml'));

    xmlFiles.forEach((file) => {
        it(`should return 201 for valid PY2026 file ${file}`, async () => {
            const filePath = path.join(folderPath, file);
            const response = await uploadQrdaFile(filePath);
            saveResultJson(file, response.data, 'py2026');
            expect(response.status).toBe(201);

            const entityType = entityTypeByFile[file];
            const expectedQpp: Record<string, unknown> = {
                performanceYear: year,
                entityType,
                measurementSets: expect.arrayContaining([
                    expect.objectContaining({ submissionMethod: 'electronicHealthRecord' }),
                    expect.objectContaining({ performanceStart: expect.stringMatching(PERFORMANCE_START_REGEX_2026) }),
                    expect.objectContaining({ performanceEnd: expect.stringMatching(PERFORMANCE_END_REGEX_2026) }),
                    expect.objectContaining({ source: 'qrda3' })]),
            };
            if (entityIdByFile[file]) {
                expectedQpp.entityId = entityIdByFile[file];
            }
            if (entityType === 'group' || entityType === 'individual') {
                expectedQpp.taxpayerIdentificationNumber = expect.stringMatching(TIN_REGEX);
            }
            if (entityType === 'individual') {
                expectedQpp.nationalProviderIdentifier = expect.stringMatching(NPI_REGEX);
            }

            expect(response.data.qpp).toMatchObject(expectedQpp);
            expect(response.data.warnings).toEqual([]);
        });
    });
});
