#!/usr/bin/env node

const siteweb = require('./index.js')
const defaultOptions = require('./defaultOptions.js')
const argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .argv;

if (process.argv && process.argv.length > 1) {
  defaultOptions.outputFile = '' // Default to no output file over cli because of stdout.
  const options = Object.assign({}, defaultOptions, argv)

  options.startUrls = options.startUrls.concat(options._)

  siteweb.run(options, (err, data) => {
    if (err) {
      throw new Error(err)
    }
    process.stdout.write(JSON.stringify(data))
  })
} else {
  throw new Error('You need to pass arguments to css-razor')
}
