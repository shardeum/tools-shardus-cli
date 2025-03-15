# Code Coverage Implementation Plan for Shardus CLI

## Overview

This document outlines a plan to enhance the Shardus CLI tool with code coverage capabilities. The implementation will allow users to selectively enable code coverage for specific processes in a local Shardus network, supporting both Istanbul/NYC and C8 coverage tools.

## Requirements

1. Support generating code coverage for selected process types:
   - Archiver nodes
   - Validator nodes
   - Monitor server
   - Explorer server

2. Allow specification of which specific instances should have coverage (e.g., only specific validator ports)

3. Support both Istanbul/NYC and C8 coverage tools

4. Organize coverage output in a structured way within the instances folder

5. Configure through the network-config.json file with a sensible default (coverage off)

## Configuration Design

The coverage configuration will be added to the `network-config.json` file with the following structure:

```json
{
  "coverage": {
    "tool": "off",  // Options: "off", "istanbul", "c8"
    "targets": {
      "archivers": [1, 2],  // Array of archiver indices to instrument (starts from 1)
      "validators": [9001, 9002, 9003],  // Array of validator ports to instrument
      "monitor": true,  // Whether to instrument the monitor server
      "explorer": false  // Whether to instrument the explorer server
    },
    "outputDir": "coverage"  // Directory for coverage output, relative to instances folder
  }
}
```

## Implementation Steps

### 1. Update Default Configuration

Modify the default network configuration in `tools-shardus-cli-network/src/configs/default-network-config.js` to include the coverage settings with default values:

```javascript
// Add to existing configuration
coverage: {
  tool: "off",
  targets: {
    archivers: [],
    validators: [],
    monitor: false,
    explorer: false
  },
  outputDir: "coverage"
}
```

### 2. Modify PM2 Start Function

Enhance the `pm2Start` function in `tools-shardus-cli-network/src/lib/util.js` to support adding coverage instrumentation:

1. Add a new parameter to accept coverage settings
2. If coverage is enabled for the process being started:
   - Determine the appropriate coverage tool command
   - Modify the node command to include coverage instrumentation
   - Configure the coverage output directory

### 3. Update Start Implementation

Modify the `start.js` implementation in `tools-shardus-cli-network/src/lib/start.js`:

1. Read coverage settings from network configuration
2. For each process being started (archiver, monitor, explorer, validators):
   - Check if coverage is enabled for this specific instance
   - If enabled, pass appropriate coverage parameters to `pm2Start`
   - Ensure output directory exists

### 4. Package Dependencies

Update package.json to include the necessary dependencies:

```json
"dependencies": {
  // existing dependencies...
  "nyc": "^15.1.0",  // For Istanbul coverage
  "c8": "^7.12.0"    // For C8 coverage, when selected
}
```

### 5. Coverage Output Handling

For each process with coverage enabled:

1. Create an instance-specific subdirectory for coverage output
2. Configure the coverage tool to output to that directory
3. Set up appropriate environment variables for coverage collection

## Implementation Details

### Coverage Command Wrapping

For Istanbul/NYC coverage, the node command would be wrapped like:

```
nyc --reporter=lcov --reporter=text --report-dir={outputDir}/{processName} node {scriptPath}
```

For C8 coverage:

```
c8 --reporter=lcov --reporter=text --report-dir={outputDir}/{processName} node {scriptPath}
```

### Process Targeting Mechanism

When starting a process, we'll check the coverage configuration to determine if that specific process should be instrumented:

1. For archivers: Check if the archiver's index is in the `targets.archivers` array
2. For validators: Check if the validator's port is in the `targets.validators` array
3. For monitor/explorer: Check the corresponding boolean value

## PM2 Integration Approach

After analyzing the validator's package.json and the Shardus CLI codebase, it's clear that all process launching is handled directly by the CLI through PM2, not by calling npm scripts. This has important implications for our implementation:

### PM2 Process Launch Mechanism

1. The CLI uses `pm2Start` function in `util.js` which executes commands like:
   ```javascript
   const execaCmd = `${pm2} start ${script} --name="${name}" ${parsedPm2Args}`
   ```

2. PM2 directly references JavaScript files rather than executing npm scripts from package.json files.

3. For example, validators are started with:
   ```javascript
   await util.pm2Start(networkDir, networkConfig.serverPath, path.basename(instances[i]), { BASE_DIR: instances[i] }, pm2Args)
   ```

### Coverage Implementation Options

We have several options for implementing coverage within this PM2 setup:

1. **Using PM2 Interpreter Option (Recommended)**:
   - Modify the PM2 command to use the `--interpreter` flag when coverage is enabled
   - For istanbul: `pm2 start ${script} --name="${name}" --interpreter="./node_modules/.bin/nyc" --interpreter-args="--reporter=lcov...node" ${parsedPm2Args}`
   - This approach keeps the coverage tool as a wrapper around node

2. **Using a Shell Script Wrapper**:
   - Create a shell script that sets up coverage and then executes node
   - Configure PM2 to run this script instead of directly running node
   - Adds complexity but gives more control over the execution environment

3. **Modifying PM2 Node Args**:
   - Use the existing `pm2--node-args` parameter to pass additional arguments
   - May have limitations with complex coverage tool configurations

### No Need for Package.json Modifications

A key advantage of our approach is that we won't need to modify the package.json files of the validator, archiver, or monitor packages. All coverage instrumentation can be handled entirely from the CLI side since:

1. The CLI has direct control over how node processes are started
2. We can inject coverage tools at the PM2 command level
3. Dependencies for coverage tools can be added to the CLI package only

### Potential Challenges

1. **PM2 Process Management**: PM2 has specific expectations about process execution, and we need to ensure that adding coverage doesn't interfere with its ability to manage processes.

2. **Configuring Coverage Tools**: We'll need to carefully configure the coverage tools to work correctly when launched through PM2.

3. **Performance Impact**: Coverage instrumentation adds overhead; running many instrumented processes may significantly impact performance.

### Compatability Considerations

1. Ensure the coverage instrumentation doesn't interfere with PM2's process management
2. Handle potential performance implications of running with coverage
3. Ensure coverage files are properly cleaned up when the network is reset

## Testing Plan

1. Test with coverage turned off to ensure normal operation
2. Test with Istanbul coverage on specific processes
3. Test with C8 coverage on specific processes
4. Verify that coverage reports are generated in the correct locations
5. Test with different combinations of targeted processes

## Future Enhancements

1. Add command-line options to control coverage settings directly
2. Add a command to generate combined coverage reports
3. Support for additional coverage tools
4. Integration with CI/CD workflows 