#!/usr/bin/env node

'use-strict';

require('isomorphic-fetch')
const cheerio = require('cheerio')
const Url = require('url')
const Queue = require('promise-queue')
const defaultOptions = require('./defaultOptions.js')

// Make initial promise from startUrls
// Go to pages and make more promises [cascading]
// After all the promises are done return data.


// getRequestData
// getPageData
// Start timer


function buildOutput(opt, callback) {
  const options = Object.assign({}, defaultOptions, opt)
  const queue = new Queue(options.concurrency, options.maxQueue)
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
        requests[startUrl] = {}
        requests[startUrl].startTime = Date.now()
        return fetchUrl(startUrl, true)
      })
    })
  }
  // const p = new Promise(function(resolve, reject) {
      // queue.then(function(data) {
      //   console.log('12412432')
      //   console.log(data)
      //   // resolve(output)
      //   return output
      // }).catch(function(e) {
      //   console.error(e);
      // })
  // })

  // Fetch a url
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
        obj.status = getHeader('last-modified', r)
        obj.contentLength = getHeader('content-length', r)
        return r.text()
      }).then(function(d) {
        const $ = cheerio.load(d)
        const links = $('a')

        // Build output object.
        obj.linkCount = links.length
        obj.url = url
        obj.isInternal = internal
        obj.fetchTime = requests[url].deltaTime
        // This sets the data key to output.
        const where = internal ? 'internal' : 'external'
        output.pages[where][url] = obj

        if (internal) {
          links.each((i, link) => {
            processLink(i, link, url)
          })
        }
        // console.log(output);
        return output
      })
      .then(function(output) {
        console.log(queue);
        if (queue.pendingPromises === 1) {
          console.log(queue.pendingPromises);
          process.stdout.write(JSON.stringify(output))
          process.stdout.write('\n')
          resolve(output)
          // process.stdout.write(JSON.stringify(requests))
          return output
        }
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
              requests[fullUrl] = {}
              requests[fullUrl].startTime = Date.now()
              return fetchUrl(fullUrl, fullUrlInternal)
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

module.exports = buildOutput
