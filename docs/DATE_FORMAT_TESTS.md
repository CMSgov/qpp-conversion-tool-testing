# Date Format Validation Tests

This document provides an overview of the date format validation tests for the QPP Conversion Tool.

## Test Files

The date format validation tests are located in `/tests/dateFormat.spec.ts`. These tests validate that the Conversion Tool properly enforces date format requirements for QRDA files.

## Test Cases

### 1. PCF-11a: Improper Performance Period Start/End Dates

This test validates that the Conversion Tool rejects files with incorrect performance period start and end dates. The expected error codes are:
- Error Code 55: A PCF performance period must start on 01/01/2025
- Error Code 56: A PCF performance period must end on 12/31/2025

### 2. PCF-11b: Improper Performance Period Format

This test validates that the Conversion Tool rejects files with improperly formatted performance periods. The expected error codes are:
- Error Code 55: A PCF performance period must start on 01/01/2025
- Error Code 56: A PCF performance period must end on 12/31/2025

### 3. PCF-11c: Missing Performance Period

This test validates that the Conversion Tool rejects files with missing performance periods. The expected error code is:
- Error Code 32: The Quality Measure section must only have one Reporting Parameter Act

## Running the Tests

To run only the date format validation tests:

```bash
npm run test:dateFormat
```

## Test Strategy

The date format validation tests follow these principles:

1. **File Selection**: Test files are selected from the `test-data/2025-sample-files/failures` directory.
2. **Error Handling**: Each test uses a try/catch block to properly handle the expected 422 HTTP status code.
3. **Error Validation**: Tests use `expect.toMatchObject` and `expect.arrayContaining` to validate that the response contains the correct error codes and messages.
4. **Result Storage**: Test results are saved using `saveResultJson()` for later analysis.

## Future Improvements

1. **Additional Test Cases**: Consider adding tests for other date format validation scenarios, such as:
   - Invalid date formats in other sections of the QRDA file
   - Date formats that don't match the specified performance period
   - Multiple conflicting performance periods

2. **Test Data Organization**: Organize test data files by validation type to make it easier to find relevant files for specific test scenarios.

3. **Parameterized Tests**: Consider refactoring tests to use parameterized test patterns for improved maintainability.
