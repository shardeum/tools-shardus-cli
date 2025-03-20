#!/usr/bin/env node

const prog = require('caporal')
const shardusNetwork = require('@shardeum-foundation/tools-shardus-cli-network')
const shardusDebug = require('@shardeum-foundation/tools-shardus-cli-debugger')
const packageJson = require('../package.json')

prog.bin('shardus').name('Shardus CLI').version(packageJson.version)

for (const command in shardusNetwork.register) shardusNetwork.register[command](prog)
for (const command in shardusDebug.register) shardusDebug.register[command](prog, 'debug')

prog.parse(process.argv)
