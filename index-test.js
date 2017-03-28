#!/usr/bin/env node

'use-strict';

var spawn = require('child_process').spawn;
var siteweb = require('./index.js');
var blogData = require('./test/blog-data.js');

describe('siteweb', function() {
  it('should test blog.timscanlin.net by default for internal pages', function(done) {
    siteweb.run({}, function(err, data) {
      expect(Object.keys(data.pages.internal).length).toEqual(Object.keys(blogData.internal).length)
      done()
    })
  })

  it('should test blog.timscanlin.net by default for external pages', function(done) {
    siteweb.run({}, function(err, data) {
      expect(Object.keys(data.pages.external).length).toEqual(blogData.external.length)
      done()
    })
  })

  it('should work via cli', function(done) {
    const cli = spawn('node', ['./cli.js'])

    cli.stdout.on('data', function(data) {
      // TODO: Note to self, this is a very bad test since the output response
      // could vary alot if latency increases for instance. Redo this check to
      // be better in the future, but for now it seems reliable enough.
      expect(data.toString().length).toEqual(blogData.stringified.length)
    })

    cli.on('close', function(code) {
      expect(code).toEqual(0)
      done()
    })
  })
})
