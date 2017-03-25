#!/usr/bin/env node

'use-strict';

require('isomorphic-fetch')
const cheerio = require('cheerio')
const Url = require('url')
const defaultOptions = require('./defaultOptions.js')

// Make initial promise from startUrls
// Go to pages and make more promises [cascading]
// After all the promises are done return data.

function buildOutput(opt, callback) {
  const options = Object.assign({}, defaultOptions, opt)
  const output = {
    pages: {
      internal: {},
      external: {},
    }
  }
  const requests = {}
  var pageCount = 0

  const p = new Promise(function(resolve, reject) {
    if (options.startUrls && options.startUrls.length) {
      const promises = options.startUrls.map(function(startUrl) {
        requests[startUrl] = {}
        requests[startUrl].startTime = Date.now()
        return fetchUrl(startUrl, true)
      })
      Promise.all(promises).then((d) => {
        resolve(output)
      })
    }
  })

  function fetchUrl(url, internal) {
    url = url.split('#')[0]
    const obj = {}
    pageCount++
    if (pageCount > options.maxPages) {
      throw new Error('Error: Maximum number of pages reached.')
    }

    return fetch(url)
      .then(function(r) {
        requests[url].endTime = Date.now()
        requests[url].deltaTime = requests[url].endTime - requests[url].startTime
        // Add request stuff to data object.
        obj.status = r.status
        obj.lastModified = r.headers
          && r.headers._headers
          && r.headers._headers['last-modified']
          && r.headers._headers['last-modified'][0]
        obj.contentLength = r.headers
          && r.headers._headers
          && r.headers._headers['content-length']
          && r.headers._headers['content-length'][0]
        return r.text()
      }).then(function(d) {

        const $ = cheerio.load(d)
        const links = $('a')
        const newPromises = []

        // Build output object.
        obj.linkCount = links.length
        obj.url = url
        obj.isInternal = internal
        obj.fetchTime = requests[url].deltaTime
        const where = internal ? 'internal' : 'external'
        // This sets the data key to output.
        output.pages[where][url] = obj

        if (internal) {
          links.each((i, link) => {
            const href = link.attribs.href
            if (href) {
              const fullUrl = Url.resolve(url, href).split('#')[0]
              if (!requests[fullUrl]) {
                const fullUrlInternal = isInternal(url, fullUrl)
                if (fullUrlInternal || options.includeExternal) {
                  requests[fullUrl] = {}
                  if (fullUrlInternal || options.fetchExternal) {
                    requests[fullUrl].startTime = Date.now()
                    newPromises.push(fetchUrl(fullUrl, fullUrlInternal))
                  } else {
                    output.pages.external[fullUrl] = {}
                  }
                }
              }
            }
          })
        }



        if (newPromises.length > 0) {
          return Promise.all(newPromises)
        }

        return output
      }).then(options.finalPromise).catch(function(e) {
        // console.log(e);
      })
  }

  return p
}

function isInternal(baseUrl, url) {
  const hostname = Url.parse(baseUrl).hostname
  return hostname === Url.parse(url).hostname
}

module.exports = buildOutput
