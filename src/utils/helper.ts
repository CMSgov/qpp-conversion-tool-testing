import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { config } from 'dotenv';
import moment from 'moment';
import path from 'path';

/**
 * Function to upload XML file to API endpoint
 * @param filePath The path to the XML file
 * @returns The response from the API
 */
config();
let serverUrl: any;
const env = process.env.TEST_ENV || 'DEV';
const cookie = process.env.COOKIE;

export const uploadQrdaFile = async (filePath: string) => {
    //const qrdaContent = fs.readFileSync(filePath, 'utf-8');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    const baseUrl = process.env.TEST_ENV === 'IMPL' ? process.env.URL_IMP : process.env.URL_DEV
    const apiUrl = `${baseUrl}/api/submissions/converter/`; // TODO-update to support impl and dev
    let headers
    if (process.env.TEST_ENV === 'IMPL') {
        headers = {
            ...formData.getHeaders(),
            'Accept': 'application/vnd.qpp.cms.gov.v2+json',
            'Purpose': 'Test',
            'Cookie': `${process.env.COOKIE}; ${process.env.IMPLTOKEN}`,
        };
    } else {
        headers = {
            ...formData.getHeaders(),
            'Accept': 'application/vnd.qpp.cms.gov.v2+json',
            'Purpose': 'Test'
        }
    }
    const response = await axios.post(apiUrl, formData, { headers });
    return response;
};

export function getEnv() {
    return env === 'LOCAL' ? 'DEV' : env;
};

export function getReportName() {
    const reportName = process.env.npm_lifecycle_event || `adhoc:${env.toLowerCase()}`;
    return reportName.replace(/:/g, '-');
};

export function getReportTimestamp() {
    return moment().format('YYYY-MM-DDThh-mm-ss');
};

const resultsDir = path.resolve(__dirname, '../../results');

export const saveResultJson = (
    xmlFileName: string,
    data: unknown,
    subfolder: string): void => {
    const targetDir = path.join(resultsDir, subfolder);
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    const jsonFileName = xmlFileName.replace(/\.xml/, '.json');
    const jsonFilePath = path.join(targetDir, jsonFileName);
    fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

export const clearResultsFor = (subfolder: string): void => {
    const targetDir = path.join(resultsDir, subfolder);
    if (!fs.existsSync(targetDir)) return;

    fs.readdirSync(targetDir)
        .filter(file => file.endsWith('.json'))
        .forEach(file => {
            fs.unlinkSync(path.join(targetDir, file));
        });
};
