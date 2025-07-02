# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Shardus CLI** - a command-line interface tool for the Shardus/Shardeum blockchain ecosystem. It serves as a unified wrapper combining network and debugger functionality from two separate npm packages.

## Key Commands

### Development
- `npm test` - Run all unit tests
- `npm run test:watch` - Run tests in watch mode for development
- `npm run lint` - Run ESLint to check code quality
- `npm run compile` - Compile TypeScript to JavaScript
- `npm run format-check` - Check code formatting with Prettier
- `npm run format-fix` - Auto-fix code formatting issues

### Testing a Single Test
```bash
npm test -- test/unit/index.test.js  # Run a specific test file
npm test -- --testNamePattern="should export register object"  # Run tests matching a pattern
```

### Release Commands
- `npm run release-patch` - Release a patch version (x.x.X)
- `npm run release-minor` - Release a minor version (x.X.0)
- `npm run release-major` - Release a major version (X.0.0)
- `npm run release-prerelease` - Release a prerelease version

## Architecture

### Module Structure
The project acts as a facade that combines two sub-modules:
- `@shardeum-foundation/tools-shardus-cli-network` - Network management functionality
- `@shardeum-foundation/tools-shardus-cli-debugger` - Debugging functionality

### Entry Points
- `index.js` - Main module export that provides `register` and `lib` objects
- `bin/index.js` - CLI executable entry point

### Exported Structure
```javascript
{
  register: {
    network: { /* network module register functions */ },
    debug: { /* debug module register functions */ }
  },
  lib: {
    network: { /* network module lib functions */ },
    debug: { /* debug module lib functions */ }
  }
}
```

## Important Notes

1. **Node Version**: Requires Node.js 18.19.1 (specified in package.json engines)

2. **Testing**: Tests verify the module structure and ensure both network and debug modules are properly exported with their respective functions

3. **Dependencies**: Uses Caporal for CLI parsing, PM2 for process management, and ShellJS for shell operations

4. **Publishing**: This is a public npm package published under `@shardeum-foundation/tools-shardus-cli`

5. **Code Style**: Uses ESLint with Standard.js style guide and Prettier for formatting

## External Documentation

For detailed usage and command documentation, refer to: https://docs.shardus.com/docs/tools/shardus-cli-tool/README