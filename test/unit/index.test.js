/* eslint-env jest */

// Instead of mocking the modules, we'll test the structure of the exported object
describe('Shardus CLI Module', () => {
  let shardusModule

  beforeEach(() => {
    jest.resetModules()
    shardusModule = require('../../index')
  })

  test('should export register object with network and debug properties', () => {
    expect(shardusModule).toHaveProperty('register')
    expect(shardusModule.register).toHaveProperty('network')
    expect(shardusModule.register).toHaveProperty('debug')
  })

  test('should export lib object with network and debug properties', () => {
    expect(shardusModule).toHaveProperty('lib')
    expect(shardusModule.lib).toHaveProperty('network')
    expect(shardusModule.lib).toHaveProperty('debug')
  })

  test('register.network should contain network module register functions', () => {
    // Just check that it has functions, not specific mock functions
    const networkFunctions = Object.values(shardusModule.register.network)
    expect(networkFunctions.length).toBeGreaterThan(0)
    networkFunctions.forEach((fn) => {
      expect(typeof fn).toBe('function')
    })
  })

  test('register.debug should contain debug module register functions', () => {
    // Just check that it has functions, not specific mock functions
    const debugFunctions = Object.values(shardusModule.register.debug)
    expect(debugFunctions.length).toBeGreaterThan(0)
    debugFunctions.forEach((fn) => {
      expect(typeof fn).toBe('function')
    })
  })

  test('lib.network should contain network module lib functions', () => {
    // Just check that it has functions, not specific mock functions
    const networkLibFunctions = Object.values(shardusModule.lib.network)
    expect(networkLibFunctions.length).toBeGreaterThan(0)
    networkLibFunctions.forEach((fn) => {
      expect(typeof fn).toBe('function')
    })
  })

  test('lib.debug should contain debug module lib functions', () => {
    // Just check that it has functions, not specific mock functions
    const debugLibFunctions = Object.values(shardusModule.lib.debug)
    expect(debugLibFunctions.length).toBeGreaterThan(0)
    debugLibFunctions.forEach((fn) => {
      expect(typeof fn).toBe('function')
    })
  })
})
