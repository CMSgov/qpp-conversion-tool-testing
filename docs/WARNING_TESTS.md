# Warning Messages Validation Tests

This document provides an overview of the warning message validation tests for the QPP Conversion Tool.

## Test Files

The warning message validation tests are located in `/tests/warnings.spec.ts`. These tests validate that the Conversion Tool properly returns warning messages for valid QRDA files that contain potential issues.

## Test Cases

### PCF-9a: Improvement Activities Section in PCF Submission

This test validates that the Conversion Tool accepts files with an Improvement Activities section in PCF submissions but returns appropriate warning messages. The expected warning codes include:

- Error Code 90: "CT - The QRDA-III submission for PCF should not contain an Improvement Activities section. The Improvement Activities data will be ignored."
- Error Code 108: "CT - Found an unexpected NPI/TIN combination. [Details about the NPI/TIN combination issue]"
- Error Code 107: "CT - There's missing NPI/TIN combination. [Details about the missing NPI/TIN]"

## Running the Tests

To run only the warning message validation tests:

```bash
npm run test:warnings
```

## Test Strategy

The warning message validation tests follow these principles:

1. **File Selection**: Test files are selected from the `test-data/2025-sample-files/warning` directory.
2. **Success Status**: Unlike error tests, these tests expect a successful response (201 status code) since warnings don't prevent submission.
3. **Warning Validation**: Tests use `expect.arrayContaining` and `expect.objectContaining` to validate that the response contains the correct warning codes and messages.
4. **Data Validation**: Tests also validate that the converted data structure is correct despite the warnings.
5. **Result Storage**: Test results are saved using `saveResultJson()` for later analysis.

## Future Improvements

1. **Additional Test Cases**: Consider adding tests for other warning scenarios, such as:
   - Missing demographic data
   - Deprecation warnings
   - Potential data quality issues

2. **Warning Categories**: Organize tests by warning category to make it easier to understand the different types of warnings.

3. **Warning Severity**: Add tests to verify warnings of different severity levels.

4. **Parameterized Tests**: Consider refactoring tests to use parameterized test patterns for improved maintainability.
