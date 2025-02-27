/* eslint-env jest */
// Mock dependencies
const mockNetworkCommand1 = jest.fn();
const mockNetworkCommand2 = jest.fn();
const mockDebugCommand1 = jest.fn();
const mockDebugCommand2 = jest.fn();
const mockParse = jest.fn();

jest.mock('caporal', () => {
  const mockProg = {
    bin: jest.fn().mockReturnThis(),
    name: jest.fn().mockReturnThis(),
    version: jest.fn().mockReturnThis(),
    parse: mockParse
  };
  return mockProg;
});

jest.mock('@shardeum-foundation/tools-shardus-cli-network', () => ({
  register: {
    networkCommand1: mockNetworkCommand1,
    networkCommand2: mockNetworkCommand2
  }
}));

jest.mock('@shardeum-foundation/tools-shardus-cli-debugger', () => ({
  register: {
    debugCommand1: mockDebugCommand1,
    debugCommand2: mockDebugCommand2
  }
}));

jest.mock('../../package.json', () => ({
  version: '1.0.0'
}));

describe('Shardus CLI Binary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });
  
  test('should set up the CLI program with correct name and version', () => {
    const prog = require('caporal');
    
    // Require the binary file to execute it
    require('../../bin/index');
    
    expect(prog.bin).toHaveBeenCalledWith('shardus');
    expect(prog.name).toHaveBeenCalledWith('Shardus CLI');
    expect(prog.version).toHaveBeenCalledWith('1.0.0');
  });
  
  test('should register all network commands', () => {
    // Require the binary file to execute it
    require('../../bin/index');
    
    expect(mockNetworkCommand1).toHaveBeenCalled();
    expect(mockNetworkCommand2).toHaveBeenCalled();
  });
  
  test('should register all debug commands', () => {
    // Require the binary file to execute it
    require('../../bin/index');
    
    expect(mockDebugCommand1).toHaveBeenCalled();
    expect(mockDebugCommand2).toHaveBeenCalled();
  });
  
  test('should parse process arguments', () => {
    // Require the binary file to execute it
    require('../../bin/index');
    
    expect(mockParse).toHaveBeenCalledWith(process.argv);
  });
}); 