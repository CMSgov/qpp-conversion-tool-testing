# QPP Conversion Tool Testing

This repository contains testing scripts for the QPP Conversion Tool.

## Overview

This project provides automated testing capabilities for the QPP Conversion Tool, allowing you to verify functionality across different environments.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/CMSgov/qpp-conversion-tool-testing.git
cd qpp-conversion-tool-testing
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the root directory with the necessary configuration
   - Example configuration based on your current environment:
     ```
     # URLs for different environments
     URL_DEV=https://dev.qpp.cms.gov
     URL_IMP=https://imp.qpp.cms.gov
     URL_DEVPRE=https://preview.qpp.cms.gov
     
     # Authentication token (replace with your actual token)
     IMPLTOKEN=qpp_auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     
     # The environment to test in
     TEST_ENV=DEV
     
     # Testing year
     CT_YEAR=2025
     ```

## Running Tests

### Environment Selection

- Run tests against the implementation environment:
```bash
npm run test:impl
```

- Run tests against the development environment:
```bash
npm run test:dev
```

### Specific Test Suites

- Run date format tests only:
```bash
npm run test:dateFormat
```

- Run warning message tests only:
```bash
npm run test:warnings
```

### Test Configuration

Tests can be configured using the following approaches:

1. Environment variables in your `.env` file
2. Command line parameters: `TEST_PARAM=value npm run test:dev`
3. Configuration files in the `config/` directory

### Test Reports

Test reports are generated after each test run and can be found in the `reports/` directory.

## Troubleshooting

If you encounter issues:

1. Ensure your API keys and environment variables are correctly set
2. Check network connectivity to the test environments
3. Verify that the QPP Conversion Tool instances are running and accessible
4. Review the logs in the `logs/` directory for detailed error information

## Contributing

1. Create a branch for your changes
2. Make your changes and write tests
3. Submit a pull request for review




