const shardusNetwork = require('@shardeum-foundation/tools-shardus-cli-network')
const shardusDebug = require('@shardeum-foundation/tools-shardus-cli-debugger')

module.exports = {
  register: {
    network: shardusNetwork.register,
    debug: shardusDebug.register,
  },
  lib: {
    network: shardusNetwork.lib,
    debug: shardusDebug.lib,
  },
}
