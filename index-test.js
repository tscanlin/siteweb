#!/usr/bin/env node

'use-strict';

var siteweb = require('./index.js');
var blogData = require('./test/blog-data.js');

describe('siteweb', function() {
  it('should test blog.timscanlin.net by default for internal pages', function(done) {
    siteweb.run({}, function(data) {
      expect(Object.keys(data.pages.internal).length).toEqual(Object.keys(blogData.internal).length)
      done()
    })
  })

  it('should test blog.timscanlin.net by default for external pages', function(done) {
    siteweb.run({}, function(data) {
      expect(Object.keys(data.pages.external).length).toEqual(blogData.external.length)
      done()
    })
  })
})
