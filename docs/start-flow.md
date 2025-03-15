# Shardus CLI Tool Flow

## Overview

The Shardus CLI tool is designed to simplify the creation and management of local Shardus networks for testing and development. This document outlines the flow of the key commands and their implementation.

The architecture consists of three main packages:
- `tools-shardus-cli`: The main CLI interface that users install globally
- `tools-shardus-cli-network`: Handles the network operations (creating, starting, stopping nodes)
- `tools-shardus-cli-debugger`: Provides debugging capabilities

## Command Flow

### Installation Flow

When a user installs the Shardus CLI tool globally:

1. `npm install -g @shardeum-foundation/tools-shardus-cli`
2. This makes the `shardus` command available globally
3. The CLI tool uses the `caporal` library to define and handle commands
4. It imports `tools-shardus-cli-network` and `tools-shardus-cli-debugger` as dependencies
5. It registers commands from both packages for network management and debugging

### Create Command Flow (`shardus create 10`)

When a user runs `shardus create 10` from a validator folder:

1. The command is handled by the `create` action in `tools-shardus-cli-network/src/actions/create.js`
2. The action determines the network directory (defaults to `./instances`)
3. It checks if a network directory already exists:
   - If it exists, it updates the existing configuration to add more nodes
   - If it doesn't exist, it uses default configuration or prompts for user input
4. It calls the `create` function from `tools-shardus-cli-network/src/lib/create.js` to:
   - Create the network directory structure
   - Create individual node directories
   - Generate configuration files for each node
   - Configure network settings
5. It sets up log rotation using PM2 if enabled
6. If `--no-start` is not specified, it then calls the `start` function to start the network

### Start Command Flow (`shardus start 10`)

When a user runs `shardus start 10`:

1. The command is handled by the `start` action in `tools-shardus-cli-network/src/actions/start.js`
2. It attempts to find and use an existing network directory:
   - If found, it uses the `start` function to start nodes
   - If not found, it falls back to the `create` action to create and then start nodes
3. The `start` function in `tools-shardus-cli-network/src/lib/start.js`:
   - Changes to the network directory
   - Reads the network configuration from `network-config.json`
   - Sets up PM2 parameters for process management
   - Starts the components in the following order:
     1. Archivers (if configured)
     2. Monitor server (if configured)
     3. Explorer server (if configured)
     4. Validator nodes
   - Updates the network configuration file with running ports
   - Displays connection URLs for monitoring

### Key Components Started

1. **Archiver Nodes**: Store historical data and provide it upon request
   - Started from `@shardeum-foundation/archiver` package
   - Each has a unique port and cryptographic keys

2. **Monitor Server**: Provides a web interface for monitoring the network
   - Started from `@shardeum-foundation/monitor-server` package
   - Connected to archivers for data access

3. **Explorer Server**: Provides a block explorer interface
   - Optional component
   - Started from `explorer-server` package

4. **Validator Nodes**: Run the consensus protocol and validate transactions
   - Multiple instances started with unique ports
   - Configuration based on network settings

## PM2 Process Management

The Shardus CLI tool uses PM2 for managing all processes:

1. Each component is started as a separate PM2 process
2. Log rotation is configured when enabled
3. Process restart behavior is controlled through PM2 arguments
4. The PM2 home directory is set to `.pm2/` within the network directory
5. All processes are managed through a shared PM2 instance

## Common Command Patterns

### Creating and Starting a Network

```
shardus create 10
```
This creates a network with 10 validator nodes, plus archiver and monitor servers, and starts them.

### Stopping and Cleaning

```
shardus stop
shardus clean
```
These commands stop all processes and clean the state data.

### Starting After Clean

```
shardus start 10
```
This starts the existing network with 10 nodes after it has been stopped.

### Adding More Nodes

```
shardus create 5
```
This adds 5 more nodes to an existing network.

## Configuration

The network configuration is stored in:
- `network-config.json`: Global network settings
- Individual `config.json` files in each node's directory

The main settings include:
- Port ranges for internal and external communication
- Archiver settings
- Monitor server URL
- Log rotation settings
- Node paths and entry points

## Dependencies

The Shardus CLI tool depends on:
- Node.js (version 18.19.1)
- PM2 for process management
- The validator codebase being present in the working directory 