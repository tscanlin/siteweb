#!/usr/bin/env node

'use-strict';

require('isomorphic-fetch')
const cheerio = require('cheerio')
const Url = require('url')
const Queue = require('promise-queue')
const defaultOptions = require('./defaultOptions.js')


function run(opt, callback) {
  const options = Object.assign({}, defaultOptions, opt)
  const queue = new Queue(options.concurrency, options.maxQueue)
  // Main data structure.
  const output = {
    pages: {
      internal: {},
      external: {},
    }
  }
  const requests = {}
  var pageCount = 0

  // Add start urls to queue.
  if (options.startUrls && options.startUrls.length) {
    options.startUrls.forEach(function(startUrl) {
      queue.add(function() {
        return fetchUrl(startUrl, true)
      }).then(function(data) {
        return data
      }).catch(function(e) {
        console.error(e);
      })
    })
  }

  // Fetch a url
  function fetchUrl(url, internal) {
    const obj = {}
    pageCount++
    if (pageCount > options.maxPages) {
      throw new Error('Error: Maximum number of pages reached.')
    }
    url = url.split('#')[0]

    requests[url] = {}
    requests[url].startTime = Date.now()
    return fetch(url)
      .then(function(r) {
        requests[url].endTime = Date.now()
        requests[url].deltaTime = requests[url].endTime - requests[url].startTime
        // Add request stuff to data object.
        obj.fetchTime = requests[url].deltaTime
        obj.status = getHeader('last-modified', r)
        obj.contentLength = getHeader('content-length', r)
        return r.text()
      }).then(function(d) {
        const $ = cheerio.load(d)
        const links = $('a')

        // Build `output` object.
        obj.linkCount = links.length
        obj.url = url
        obj.isInternal = internal

        // This sets the data key on `output`.
        const where = internal ? 'internal' : 'external'
        output.pages[where][url] = obj

        if (internal) {
          links.each((i, link) => {
            processLink(i, link, url)
          })
        }
        return output
      }).catch(function(e) {
        console.error(e);
      })
  }

  function processLink(i, link, url) {
    const href = link.attribs.href
    if (href) {
      const fullUrl = Url.resolve(url, href).split('#')[0]
      if (!requests[fullUrl]) {
        const fullUrlInternal = isInternal(url, fullUrl)
        if (fullUrlInternal || options.includeExternal) {
          if (fullUrlInternal || options.fetchExternal) {
            queue.add(function() {
              return fetchUrl(fullUrl, fullUrlInternal)
            }).then(function(data) {
              // console.log(data);
              // console.log(queue.pendingPromises);
              if (queue.pendingPromises === 0) {
                // Final result.


                // process.stdout.write(JSON.stringify(data))
                if (callback) {
                  callback(null, output)
                }
              }
              return data
            }).catch(function(e) {
              console.error(e);
            })
          } else {
            output.pages.external[fullUrl] = {}
          }
        }
      }
    }
  }

  // return p
}


function getHeader(header, response) {
  return response.headers
    && response.headers._headers
    && response.headers._headers[header]
    && response.headers._headers[header][0]
}


function isInternal(baseUrl, url) {
  const hostname = Url.parse(baseUrl).hostname
  return hostname === Url.parse(url).hostname
}

module.exports = {
  run: run
}
