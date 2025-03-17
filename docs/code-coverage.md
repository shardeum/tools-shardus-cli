# Code Coverage in Shardus CLI

This document describes how to use the code coverage feature in the Shardus CLI tool.

## Overview

The Shardus CLI tool now supports code coverage for local Shardus networks. This allows you to selectively enable code coverage for specific processes in your network, supporting both Istanbul/NYC and C8 coverage tools.

## Prerequisites

For the coverage tools to work properly, you need to install the coverage tools. You have several options:

### Option 1: Install globally (recommended)

Installing the coverage tools globally makes them available to all projects:

```bash
# For Istanbul/NYC coverage
npm install -g nyc

# For C8 coverage
npm install -g c8
```

### Option 2: Install in your project

You can install the coverage tools as dev dependencies in your project:

```bash
cd your-project
npm install --save-dev nyc c8
```

### Option 3: Install in the instances directory

If options 1 and 2 don't work, you can install directly in the instances directory:

```bash
cd your-project/instances
npm install --save-dev nyc c8
```

The Shardus CLI will automatically look for the coverage tools in these locations in the following order:
1. Your project's node_modules
2. The instances directory's node_modules
3. The CLI tool's node_modules
4. Global installation (PATH)

## Configuration

Code coverage is configured through the `network-config.json` file. The configuration is added automatically with default values (coverage disabled) when creating a new network.

### Configuration Structure

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
    "outputDir": "coverage",
    "includeDependencies": [
      "@shardeum-foundation/library1",  // Include coverage for specific dependencies
      "@shardeum-foundation/**"         // Use glob pattern to include all packages in a namespace
    ],
    "env": {
      "LOAD_JSON_CONFIGS": "debug-10-nodes.config.json",
      "NODE_ENV": "development",
      "LOG_LEVEL": "debug"
    }
  }
}
```

## Including Coverage for Dependencies

By default, coverage tools exclude code in `node_modules` to improve performance. However, when you're developing libraries that are used as dependencies, you may want to track their coverage too.

The Shardus CLI now supports this via the `includeDependencies` configuration:

```json
"includeDependencies": [
  "@shardeum-foundation/crypto",
  "@shardeum-foundation/utils",
  "@shardeum-foundation/**"  // Glob pattern to include all @shardeum-foundation packages
]
```

### How It Works

When you specify dependencies in the `includeDependencies` array:

1. The CLI passes the appropriate flags to the coverage tool:
   - For NYC/Istanbul: `--include="package-name"`
   - For C8: `--include="package-name"`

2. These flags instruct the coverage tool to instrument code in those dependencies, even though they're in `node_modules`.

### Source Maps for Dependencies

For proper coverage visualization of dependencies, you need source maps. Ensure your dependencies:

1. Generate source maps during their build process (`"sourceMap": true"` in tsconfig.json)
2. Include both the compiled code and source maps in their npm package

Without source maps, you may still collect coverage data, but it will be harder to visualize in HTML reports.

### Best Practices

- Be selective about which dependencies to include, as instrumenting too many can impact performance
- Use glob patterns (like `@shardeum-foundation/**`) to include all packages in a namespace
- For dependencies you control, ensure they generate and publish source maps
- If coverage reports don't show source files properly, check that source maps are correctly configured in the dependency

## Environment Variable Handling

When running processes with code coverage enabled, the CLI creates a wrapper script that properly sets up the environment before invoking the coverage tool. Environment variables are handled with the following priority order:

1. **Coverage Configuration Variables** (Highest Priority)
   - Environment variables specified in the `coverage.env` section of the network configuration
   - These override all other sources

2. **Explicit PM2 Environment Variables**
   - Environment variables directly passed to the process in the CLI code
   - These include variables like `BASE_DIR`, `PORT`, `ARCHIVER_INFO`, etc.
   - They are overridden by variables in `coverage.env` if the same variable is defined in both places

3. **Process Environment Variables** (Lowest Priority)
   - Environment variables from the shell where the CLI is running
   - Includes variables like `NODE_ENV`, `LOAD_JSON_CONFIGS`, etc.
   - The CLI automatically preserves common environment variables and those with prefixes like `SHARDUS_`, `SHARDEUM_`, `ARCHIVER_`, etc.

This ensures that all necessary environment variables are available to your processes when running with coverage enabled.

### Example: Wrapper Script

A typical wrapper script generated by the CLI might look like this:

```bash
#!/bin/bash

# Wrapper script generated by Shardus CLI for coverage

# Environment variables from coverage configuration
export LOAD_JSON_CONFIGS="debug-10-nodes.config.json"
export LOG_LEVEL="debug"

# Environment variables passed directly to pm2Start
export BASE_DIR="/path/to/instances/shardus-instance-9001"
export PM2_HOME="/path/to/instances/.pm2/"

# Important environment variables from the current process
export NODE_ENV="development"
export ARCHIVER_INFO="127.0.0.1:4000:758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3"

# Additional environment variables with common prefixes
export SHARDUS_NETWORK_ID="localnet"

# Execute with Istanbul/NYC coverage
nyc --reporter=lcov --reporter=text --report-dir="coverage/shardus-instance-9001" node /path/to/dist/src/index.js "$@"
```

## Understanding Coverage Files and Scripts

When you run a Shardus network with coverage enabled, the following files and directories are created:

1. **Wrapper Scripts** (`instances/.nyc-wrapper-shardus-instance-*.sh`): These are automatically generated shell scripts that wrap the node process with the coverage tool. They handle:
   - Setting up environment variables
   - Executing the process with coverage tools
   - Storing coverage data in the correct location
   
   These wrapper scripts are automatically regenerated when you start the network with coverage enabled, and they're removed when you run `shardus coverage clean`.

2. **Coverage Data** (`instances/coverage/`): This directory contains all the raw coverage data collected by the coverage tools:
   - `lcov.info` files: LCOV format coverage reports
   - `.nyc_output` directories: Raw coverage data in NYC format
   - `coverage-final.json` files: JSON format coverage data
   - `v8.json` files: V8 format coverage data (when using C8)

3. **Merged Reports** (`instances/coverage/merged-validators/`): When you run `shardus coverage merge`, this directory is created to store the combined coverage reports from all processes of the same type.

All of these files and directories are cleaned up when you run `shardus coverage clean`.

## Coverage Commands

You can manage code coverage data using the following commands:

#### View Coverage Status

```bash
shardus coverage status
```

This command displays information about the available coverage data, including the number of coverage reports by type (validators, archivers, monitor, explorer) and any merged reports.

#### Clean Coverage Data

```bash
shardus coverage clean
```

This command:
- Deletes all coverage data from the coverage directory
- Removes any wrapper scripts (`.nyc-wrapper-*.sh`) from the instances directory
- Allows you to start fresh with a new test run

You can use the `--verbose` flag to see a detailed list of what is being deleted:

```bash
shardus coverage clean --verbose
```

#### Merge Coverage Data

```bash
shardus coverage merge
```

This command merges coverage data by type (validators, archivers, monitor, explorer) and generates combined reports. This is particularly useful when you have multiple validator or archiver nodes and want to see their combined coverage.

The merged reports are stored in subdirectories of your coverage directory:
- `merged-validators` - Combined coverage for all validators
- `merged-archivers` - Combined coverage for all archivers
- `merged-monitor` - Coverage for monitor servers
- `merged-explorer` - Coverage for explorer servers

After merging, HTML reports are generated in each merged directory, which you can view in your browser:

```bash
open instances/coverage/merged-validators/lcov-report/index.html
```

### Command Options

All coverage commands accept the following options:

- `-d, --dir <network_dir>` - The directory containing the coverage data (defaults to ./instances)
- `--tool <tool>` - Override the coverage tool specified in the network config (istanbul or c8)
- `--outputdir <output_dir>` - The output directory for coverage data within the network directory (defaults to coverage)
- `--global` - Force using globally installed coverage tools
- `--verbose` - Show more detailed output during operations

Example with options:

```bash
# Use the globally installed coverage tool with verbose output
shardus coverage merge --global --verbose

# Override the tool and specify a custom output directory
shardus coverage merge -d ./my-network --tool c8 --outputdir my-coverage
```

### Troubleshooting Coverage Commands

If you encounter errors when running the coverage commands:

1. **Install Coverage Tools Globally**: The most reliable way to use the coverage commands is with globally installed tools:
   ```bash
   npm install -g nyc c8
   ```
   Then use the `--global` flag when running coverage commands:
   ```bash
   shardus coverage merge --global
   ```

2. **Check for Coverage Files**: The merge command requires that coverage reports were generated correctly. Verify that your coverage directories contain files like `coverage-final.json` or `.nyc_output/`.

3. **Use Verbose Mode**: If you're having trouble diagnosing issues, try using verbose mode:
   ```bash
   shardus coverage merge --verbose
   ```

4. **Manual Merge**: If the automatic merge still fails, you can merge coverage reports manually:
   ```bash
   cd instances
   nyc merge coverage/shardus-instance-9001/.nyc_output coverage/merged/coverage.json
   nyc report -t coverage/merged --reporter=lcov --reporter=text
   ```

## Usage

### Enabling Coverage

1. Install the coverage tools using one of the methods described in the Prerequisites section.

2. Create a network as usual:
   ```
   shardus create 10
   ```

3. Locate and edit the `network-config.json` file in your instances directory:
   ```
   cd instances
   nano network-config.json
   ```

4. Modify the coverage configuration to enable code coverage:
   ```json
   "coverage": {
     "tool": "istanbul",  // Use "istanbul" or "c8"
     "targets": {
       "archivers": [1],  // First archiver
       "validators": [9001, 9002, 9003],  // Validators with these ports
       "monitor": true,
       "explorer": false
     },
     "outputDir": "coverage"
   }
   ```

5. Start or restart your network:
   ```
   shardus stop
   shardus start 10
   ```

### Viewing Coverage Reports

Coverage reports are generated in the specified output directory within your instances folder. For each instrumented process, a subdirectory is created with the process name.

For example:
```
instances/coverage/archive-server-1/
instances/coverage/shardus-instance-9001/
instances/coverage/monitor-server/
```

Each directory contains both HTML and LCOV format reports. To view the HTML report, open the `index.html` file in your browser:
```
open instances/coverage/shardus-instance-9001/lcov-report/index.html
```

## Coverage Tools

### Istanbul/NYC

When using Istanbul/NYC (`"tool": "istanbul"`), the coverage tool collects line, branch, and function coverage information.

### C8

When using C8 (`"tool": "c8"`), the coverage tool provides V8-native coverage information, which can be more accurate for modern JavaScript and TypeScript code.

## Performance Considerations

Enabling code coverage adds overhead to the instrumented processes. For production-like performance testing, it's recommended to keep coverage disabled (`"tool": "off"`).

## Passing Environment Variables to Coverage-Enabled Processes

When running processes with coverage enabled, you may need to pass specific environment variables to them, such as configuration file paths or debug settings. There are two ways to accomplish this:

### 1. Using the coverage.env Configuration

You can specify environment variables in your `network-config.json` file under the coverage section:

```json
{
  "coverage": {
    "tool": "istanbul",
    "outputDir": "coverage",
    "env": {
      "LOAD_JSON_CONFIGS": "debug-10-nodes.config.json",
      "NODE_ENV": "development",
      "LOG_LEVEL": "debug"
    },
    "targets": {
      "validators": [9001, 9002],
      "archivers": [1],
      "monitor": false,
      "explorer": false
    }
  }
}
```

These environment variables will be available to all processes that have coverage enabled.

### 2. Using Environment Variables from the Shell

Alternatively, you can set environment variables in your shell before running the Shardus CLI command:

```bash
export LOAD_JSON_CONFIGS=debug-10-nodes.config.json
shardus start 1
```

The CLI will automatically pass these variables to the coverage wrapper scripts.

> **Note**: Environment variables specified in the `coverage.env` configuration take precedence over those set in the shell environment.

## Troubleshooting

### Permission Errors (EACCES)

If you see permission errors (EACCES) when running Shardus with coverage enabled, it's likely related to the wrapper script permissions:

```
Error: EACCES: permission denied, exec '/path/to/instances/.nyc-wrapper-shardus-instance-9001.sh'
```

To resolve this:

1. **Check wrapper script permissions**:
   ```bash
   chmod +x instances/.nyc-wrapper-shardus-instance-*.sh
   ```

2. **Restart the network** or the specific instance that's having issues.

3. **Clean and regenerate wrapper scripts**:
   ```bash
   shardus coverage clean
   shardus stop
   shardus start 1
   ```

### Wrapper Script Issues

The wrapper scripts (`.nyc-wrapper-shardus-instance-*.sh`) are automatically generated to execute processes with coverage enabled. If you're having issues:

1. **Inspect a wrapper script** to see how it's configured:
   ```bash
   cat instances/.nyc-wrapper-shardus-instance-9001.sh
   ```

2. **Check if the script is executable**:
   ```bash
   ls -la instances/.nyc-wrapper-*
   ```
   All wrapper scripts should have executable (`x`) permission.

3. **Manually execute a wrapper script** for more detailed error messages:
   ```bash
   cd instances
   ./.nyc-wrapper-shardus-instance-9001.sh
   ```

4. **Generate new wrapper scripts** by cleaning coverage data and restarting:
   ```bash
   shardus coverage clean
   shardus stop
   shardus start 1
   ```

### Coverage Tool Not Found

If you see errors about the coverage tool not being found:

1. **Install the coverage tool globally**:
   ```bash
   npm install -g nyc
   # or for c8
   npm install -g c8
   ```

2. **Run coverage commands with the `--global` flag**:
   ```bash
   shardus coverage merge --global
   ```

### No Coverage Reports Generated

If coverage reports are not being generated, check:

1. The coverage tool is correctly specified ("istanbul" or "c8")
2. The targets configuration correctly specifies the processes you want to instrument
3. The processes are actually running (use `shardus ls` to verify)
4. Check the console output for messages like:
   - `Found nyc at: /path/to/nyc` (success)
   - `Warning: Could not find nyc in expected locations.` (potential problem)

### Errors Starting Processes with Coverage

If you encounter errors when starting processes with coverage:

1. **Install Coverage Tools Globally**: This is the most reliable method:
   ```bash
   npm install -g nyc c8
   ```

2. **Check Installation**: Verify the tools are properly installed:
   ```bash
   which nyc
   which c8
   ```

3. **Install in Multiple Locations**: For maximum compatibility, install in all potential locations:
   ```bash
   # Global
   npm install -g nyc c8
   
   # Project directory
   cd your-project
   npm install --save-dev nyc c8
   
   # Instances directory
   cd instances
   npm install --save-dev nyc c8
   ```

4. **Verify Coverage Tool Execution**: Test if the coverage tools run correctly:
   ```bash
   nyc --version
   c8 --version
   ```

5. **Check PM2 Logs**: Look for more detailed error messages:
   ```bash
   shardus pm2 logs
   ```

### Explorer Server Not Starting

If you see an error about missing the explorer-server module, it means the explorer server is not installed in your project. This is normal if you're not using the explorer. You can:

1. Install it if needed: `npm install --save-dev explorer-server`
2. Or set `startExplorerServer: false` in your network configuration

### Missing Environment Variables

If your process fails with errors about missing environment variables (e.g., `Environment variable ARCHIVER_INFO is not defined`):

1. **Check the Wrapper Script**: The CLI creates a wrapper script that sets up the environment. Look for it in your instances directory:
   ```bash
   cat instances/.nyc-wrapper-shardus-instance-*.sh
   ```

2. **Verify Environment Variable Sources**: Make sure the required variables are available in:
   - Your shell environment when running the CLI command (`env | grep ARCHIVER_INFO`), or
   - The `coverage.env` section of your network configuration

3. **Check the Wrapper Script Logs**: The coverage wrapper script outputs diagnostic information when it runs:
   ```bash
   shardus pm2 logs
   ```
   Look for the "Critical Environment Variables" section which shows key variables.

4. **Manually Run with Environment**: If needed, you can set the variables directly before starting:
   ```bash
   export ARCHIVER_INFO="127.0.0.1:4000:758b1c119412298802cd28dbfa394cdfeecc4074492d60844cc192d632d84de3"
   export LOAD_JSON_CONFIGS="debug-10-nodes.config.json"
   shardus start 1
   ```

## Examples

### Enabling Coverage for Specific Validators

```json
"coverage": {
  "tool": "istanbul",
  "targets": {
    "archivers": [],
    "validators": [9001, 9002],  // Only instrument validators on ports 9001 and 9002
    "monitor": false,
    "explorer": false
  },
  "outputDir": "coverage"
}
```

### Using C8 Coverage for All Components

```json
"coverage": {
  "tool": "c8",
  "targets": {
    "archivers": [1],
    "validators": [9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010],
    "monitor": true,
    "explorer": true
  },
  "outputDir": "coverage"
}
```

if (stats.validators + stats.archivers + stats.monitor + stats.explorer === 0) {
  console.log('\nNo coverage data found. Make sure you have enabled coverage in your network-config.json')
  console.log('and run some tests with coverage enabled.')
} else {
  console.log('\nRun the following commands to manage coverage:')
  console.log('  shardus coverage merge - Merge coverage data and generate reports')
  console.log('  shardus coverage clean - Clean coverage data')
} 