# Coverage Management Examples

This document shows examples of managing code coverage data with the Shardus CLI.

## Basic Workflow for Code Coverage

Here's a typical workflow for using code coverage in Shardus:

1. **Create a network with coverage enabled**:

```bash
# Create a network with 5 nodes
shardus create 5
```

2. **Edit the network configuration to enable coverage**:

```bash
# Open network-config.json
nano instances/network-config.json
```

Update the coverage section:

```json
"coverage": {
  "tool": "istanbul",
  "targets": {
    "validators": [9001, 9002],
    "archivers": [1],
    "monitor": true,
    "explorer": false
  },
  "outputDir": "coverage",
  "env": {
    "LOAD_JSON_CONFIGS": "debug-10-nodes.config.json"
  }
}
```

3. **Start the network**:

```bash
shardus start 5
```

4. **Run your tests against the network**

5. **Check coverage status**:

```bash
shardus coverage status
```

Example output:
```
Coverage Status for /path/to/instances/coverage:
Found:
  Validators: 2
  Archivers: 1
  Monitor servers: 1
  Explorer servers: 0
  Merged reports: 0

Run the following commands to manage coverage:
  shardus coverage merge - Merge coverage data and generate reports
  shardus coverage clear - Clear coverage data
```

6. **Merge coverage data by type**:

```bash
shardus coverage merge
```

Example output:
```
Performing coverage merge operation...
Merging coverage data from /path/to/instances/coverage...
Merging 2 validators coverage reports...
Running: nyc merge /path/to/instances/coverage/shardus-instance-9001 /path/to/instances/coverage/shardus-instance-9002 -o /path/to/instances/coverage/merged-validators
Running: nyc report -t /path/to/instances/coverage/merged-validators --reporter=lcov --reporter=text --report-dir=/path/to/instances/coverage/merged-validators
Merged coverage report for validators available at: /path/to/instances/coverage/merged-validators/lcov-report/index.html
Merging 1 archivers coverage reports...
Running: nyc merge /path/to/instances/coverage/archive-server-1 -o /path/to/instances/coverage/merged-archivers
Running: nyc report -t /path/to/instances/coverage/merged-archivers --reporter=lcov --reporter=text --report-dir=/path/to/instances/coverage/merged-archivers
Merged coverage report for archivers available at: /path/to/instances/coverage/merged-archivers/lcov-report/index.html
Merging 1 monitor coverage reports...
Running: nyc merge /path/to/instances/coverage/monitor-server -o /path/to/instances/coverage/merged-monitor
Running: nyc report -t /path/to/instances/coverage/merged-monitor --reporter=lcov --reporter=text --report-dir=/path/to/instances/coverage/merged-monitor
Merged coverage report for monitor available at: /path/to/instances/coverage/merged-monitor/lcov-report/index.html
Coverage merge operation completed
```

7. **View merged reports in browser**:

```bash
# Open the merged validators report
open instances/coverage/merged-validators/lcov-report/index.html

# Open the merged archivers report
open instances/coverage/merged-archivers/lcov-report/index.html

# Open the monitor report
open instances/coverage/merged-monitor/lcov-report/index.html
```

8. **Clear coverage data when done**:

```bash
shardus coverage clear
```

## Using the C8 Coverage Tool

If you prefer using the C8 coverage tool instead of Istanbul/NYC:

1. **Install C8**:

```bash
npm install -g c8
```

2. **Configure the network to use C8**:

```json
"coverage": {
  "tool": "c8",
  "targets": {
    "validators": [9001, 9002, 9003],
    "archivers": [1],
    "monitor": false,
    "explorer": false
  },
  "outputDir": "coverage"
}
```

3. **Or override the tool when merging**:

```bash
shardus coverage merge --tool c8
```

## Working with Multiple Networks

If you have multiple networks with different coverage directories:

```bash
# Merge coverage from a specific network
shardus coverage merge -d ./test-network-1

# Clear coverage from a specific network
shardus coverage clear -d ./test-network-2

# Check status of coverage in a specific network
shardus coverage status -d ./test-network-3
```

## Using Custom Output Directories

If your coverage data is in a non-standard location:

```bash
# Merge coverage from a custom output directory
shardus coverage merge --outputdir my-coverage-data

# Equivalent to
shardus coverage merge -d ./instances --outputdir my-coverage-data
``` 